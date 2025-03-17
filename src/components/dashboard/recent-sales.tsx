"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import axios from "axios"
import { toast } from "sonner"


type Sale = {
    _id: string
    customer: string
    items: Array<{
        productName: string
        quantity: number
    }>
    total: number
    date: string
}

export function RecentSales() {
    const [sales, setSales] = useState<Sale[]>([])
    const [loading, setLoading] = useState(true)
   

    useEffect(() => {
        const fetchRecentSales = async () => {
            try {
                setLoading(true)
                const response = await axios.get("/api/sales", {
                    params: {
                        limit: 5,
                        status: "Completed",
                    },
                })

                if (response.data && response.data.sales) {
                    setSales(response.data.sales)
                }
            } catch (error) {
                console.error("Error fetching recent sales:", error)
                toast("Failed to load recent sales data")
            } finally {
                setLoading(false)
            }
        }

        fetchRecentSales()
    }, [toast])

    if (loading) {
        return <div className="flex items-center justify-center h-[300px]">Loading recent sales...</div>
    }

    if (sales.length === 0) {
        return <div className="text-center py-8 text-muted-foreground">No recent sales found.</div>
    }

    return (
        <div className="space-y-8">
            {sales.map((sale) => {
                // Get the first letter of each word in the customer name for the avatar fallback
                const initials = sale.customer
                    .split(" ")
                    .map((name) => name[0])
                    .join("")
                    .toUpperCase()
                    .substring(0, 2)

                // Get the first item's product name for display
                const productName =
                    sale.items.length > 0
                        ? `${sale.items[0].productName}${sale.items.length > 1 ? ` (+${sale.items.length - 1} more)` : ""}`
                        : "No items"

                return (
                    <div key={sale._id} className="flex items-center">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src="/placeholder-user.jpg" alt="Avatar" />
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none">{sale.customer}</p>
                            <p className="text-sm text-muted-foreground">{productName}</p>
                        </div>
                        <div className="ml-auto font-medium">+${sale.total.toFixed(2)}</div>
                    </div>
                )
            })}
        </div>
    )
}

