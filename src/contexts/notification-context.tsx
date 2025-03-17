"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import axios from "axios"

type NotificationContextType = {
    unreadCount: number
    refreshNotifications: () => Promise<void>
    markAsRead: (id: string) => Promise<void>
    markAllAsRead: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [unreadCount, setUnreadCount] = useState(0)

    const refreshNotifications = async () => {
        try {
            const response = await axios.get("/api/notifications", { params: { read: false } })
            if (response.data && response.data.unreadCount !== undefined) {
                setUnreadCount(response.data.unreadCount)
            }
        } catch (error) {
            console.error("Error fetching unread notifications:", error)
        }
    }

    const markAsRead = async (id: string) => {
        try {
            await axios.put(`/api/notifications/${id}`, { read: true })
            await refreshNotifications()
        } catch (error) {
            console.error("Error marking notification as read:", error)
        }
    }

    const markAllAsRead = async () => {
        try {
            await axios.post("/api/notifications/mark-all-read")
            setUnreadCount(0)
        } catch (error) {
            console.error("Error marking all notifications as read:", error)
        }
    }

    // Initial fetch
    useEffect(() => {
        refreshNotifications()
    }, [])

    // Set up polling
    useEffect(() => {
        const interval = setInterval(refreshNotifications, 30000) // Every 30 seconds
        return () => clearInterval(interval)
    }, [])

    return (
        <NotificationContext.Provider value={{ unreadCount, refreshNotifications, markAsRead, markAllAsRead }}>
            {children}
        </NotificationContext.Provider>
    )
}

export function useNotifications() {
    const context = useContext(NotificationContext)
    if (context === undefined) {
        throw new Error("useNotifications must be used within a NotificationProvider")
    }
    return context
}

