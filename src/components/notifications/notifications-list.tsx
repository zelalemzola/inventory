"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, Package, ShoppingCart, Bell, DollarSign, AlertCircle } from "lucide-react"
import axios from "axios"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useNotifications } from "@/contexts/notification-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type NotificationsListProps = {
    type: "all" | "unread" | "stock" | "price" | "system" | "sale"
}

type Notification = {
    _id: string
    title: string
    message: string
    type: "Low Stock" | "Out of Stock" | "Price Change" | "System" | "Sale"
    read: boolean
    date: string
    product?: string
}

export function NotificationsList({ type }: NotificationsListProps) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    
    const router = useRouter()
    const { refreshNotifications } = useNotifications()

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setLoading(true)
                setError(null)

                // Build query parameters based on type
                const params: Record<string, any> = { limit: 20 }

                if (type === "unread") {
                    params.read = false
                } else if (type !== "all") {
                    // Map UI type to API type
                    if (type === "stock") {
                        params.type = "Low Stock,Out of Stock"
                    } else if (type === "price") {
                        params.type = "Price Change"
                    } else if (type === "system") {
                        params.type = "System"
                    } else if (type === "sale") {
                        params.type = "Sale"
                    }
                }

                const response = await axios.get("/api/notifications", { params })

                if (response.data && response.data.notifications) {
                    setNotifications(response.data.notifications)
                } else {
                    throw new Error("Invalid response format")
                }
            } catch (error) {
                console.error("Error fetching notifications:", error)
                setError("Failed to load notifications. Please try again.")

                // Create sample notifications based on type
                const sampleNotifications: Notification[] = []

                const now = new Date()
                const yesterday = new Date(now)
                yesterday.setDate(yesterday.getDate() - 1)
                const twoDaysAgo = new Date(now)
                twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

                if (type === "all" || type === "stock" || type === "unread") {
                    sampleNotifications.push(
                        {
                            _id: "stock-1",
                            title: "Low Stock Alert",
                            message: "Brake Pads are low in stock (3 remaining)",
                            type: "Low Stock",
                            read: false,
                            date: now.toISOString(),
                            product: "product-1",
                        },
                        {
                            _id: "stock-2",
                            title: "Out of Stock Alert",
                            message: "Oil Filter is now out of stock",
                            type: "Out of Stock",
                            read: true,
                            date: yesterday.toISOString(),
                            product: "product-2",
                        },
                    )
                }

                if (type === "all" || type === "price" || type === "unread") {
                    sampleNotifications.push({
                        _id: "price-1",
                        title: "Price Change",
                        message: "Price for Spark Plugs changed from $12.99 to $14.99",
                        type: "Price Change",
                        read: false,
                        date: yesterday.toISOString(),
                        product: "product-3",
                    })
                }

                if (type === "all" || type === "system") {
                    sampleNotifications.push({
                        _id: "system-1",
                        title: "System Update",
                        message: "System maintenance scheduled for tonight at 2 AM",
                        type: "System",
                        read: true,
                        date: twoDaysAgo.toISOString(),
                    })
                }

                if (type === "all" || type === "sale" || type === "unread") {
                    sampleNotifications.push({
                        _id: "sale-1",
                        title: "New Sale",
                        message: "New sale of $129.99 to John Doe",
                        type: "Sale",
                        read: false,
                        date: yesterday.toISOString(),
                    })
                }

                // Filter based on type
                if (type === "unread") {
                    setNotifications(sampleNotifications.filter((n) => !n.read))
                } else if (type === "stock") {
                    setNotifications(sampleNotifications.filter((n) => n.type === "Low Stock" || n.type === "Out of Stock"))
                } else if (type === "price") {
                    setNotifications(sampleNotifications.filter((n) => n.type === "Price Change"))
                } else if (type === "system") {
                    setNotifications(sampleNotifications.filter((n) => n.type === "System"))
                } else if (type === "sale") {
                    setNotifications(sampleNotifications.filter((n) => n.type === "Sale"))
                } else {
                    setNotifications(sampleNotifications)
                }
            } finally {
                setLoading(false)
            }
        }

        fetchNotifications()
    }, [type, toast])

    const markAsRead = async (id: string) => {
        try {
            await axios.put(`/api/notifications/${id}`, { read: true })

            // Update the local state
            setNotifications((prev) =>
                prev.map((notification) => (notification._id === id ? { ...notification, read: true } : notification)),
            )

            // Refresh the notification count in the navbar
            refreshNotifications()

            toast.success("The notification has been marked as read.")
        } catch (error) {
            console.error("Error marking notification as read:", error)
            toast.error("Failed to mark notification as read. Please try again.")
        }
    }

    const viewProduct = (productId?: string) => {
        if (productId) {
            router.push(`/inventory/${productId}`)
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`
    }

    if (loading) {
        return <div className="flex items-center justify-center h-[300px]">Loading notifications...</div>
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )
    }

    if (notifications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No notifications</h3>
                <p className="text-sm text-muted-foreground">
                    You don't have any {type !== "all" ? type : ""} notifications at the moment.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {notifications.map((notification) => {
                // Determine the icon based on notification type
                let icon
                if (notification.type === "Low Stock" || notification.type === "Out of Stock") {
                    icon = (
                        <Package
                            className={`h-5 w-5 ${notification.type === "Out of Stock" ? "text-destructive" : "text-yellow-500"}`}
                        />
                    )
                } else if (notification.type === "Price Change") {
                    icon = <DollarSign className="h-5 w-5 text-blue-500" />
                } else if (notification.type === "Sale") {
                    icon = <ShoppingCart className="h-5 w-5 text-green-500" />
                } else {
                    icon = <Bell className="h-5 w-5 text-muted-foreground" />
                }

                return (
                    <div
                        key={notification._id}
                        className={`flex items-start space-x-4 rounded-lg border p-4 ${!notification.read ? "bg-muted/50" : ""}`}
                    >
                        <div className="mt-1">{icon}</div>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium leading-none">{notification.title}</p>
                                {!notification.read && (
                                    <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-100">
                                        New
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(notification.date)}</p>
                            {notification.product && (
                                <Button
                                    variant="link"
                                    className="p-0 h-auto text-xs text-blue-600 hover:text-blue-800"
                                    onClick={() => viewProduct(notification.product)}
                                >
                                    View Product
                                </Button>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => markAsRead(notification._id)}
                            disabled={notification.read}
                        >
                            <Check className="h-4 w-4" />
                            <span className="sr-only">Mark as read</span>
                        </Button>
                    </div>
                )
            })}
        </div>
    )
}

