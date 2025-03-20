"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import axios from "axios"

interface SaleItem {
  _id: string
  customer: {
    name: string
    email?: string
  }
  totalAmount: number
  createdAt: string
}

export function RecentSales() {
  const [sales, setSales] = useState<SaleItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecentSales = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await axios.get("/api/sales", {
          params: {
            limit: 5,
            page: 1,
          },
        })

        if (response.data && response.data.success && response.data.data && response.data.data.sales) {
          setSales(response.data.data.sales)
        } else {
          setError("Invalid data format received from server")
        }
      } catch (err: any) {
        console.error("Error fetching recent sales:", err)
        setError(err.message || "Failed to load recent sales")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecentSales()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-8">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center animate-pulse">
            <div className="h-9 w-9 rounded-full bg-gray-200"></div>
            <div className="ml-4 space-y-1 flex-1">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-3 w-32 bg-gray-200 rounded"></div>
            </div>
            <div className="h-4 w-16 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-md">
        <p className="text-red-500">Error: {error}</p>
      </div>
    )
  }

  if (sales.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">No recent sales found</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {sales.map((sale) => (
        <div key={sale._id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{sale.customer.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{sale.customer.name}</p>
            <p className="text-sm text-muted-foreground">{sale.customer.email || "No email provided"}</p>
          </div>
          <div className="ml-auto font-medium">
            ${sale.totalAmount.toFixed(2)}
            <div className="text-xs text-muted-foreground">{new Date(sale.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

