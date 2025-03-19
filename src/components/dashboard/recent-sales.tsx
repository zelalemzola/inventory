"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import axios from "axios"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

type RecentSale = {
  _id: string
  customer: string
  total: number
  date: string
  status: string
}

export function RecentSales() {
  const [sales, setSales] = useState<RecentSale[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchRecentSales = async () => {
      try {
        setLoading(true)
        const response = await axios.get("/api/sales", {
          params: {
            limit: 5,
            page: 1,
            sortBy: "date",
            sortOrder: "desc",
          },
        })

        if (response.data && response.data.sales) {
          setSales(response.data.sales)
        }
      } catch (error) {
        console.error("Error fetching recent sales:", error)
        toast({
          title: "Error",
          description: "Failed to load recent sales",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchRecentSales()
  }, [toast])

  // Function to get initials from customer name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // Function to get a consistent color based on customer name
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-red-500",
      "bg-green-500",
      "bg-blue-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ]

    // Simple hash function to get a consistent index
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  // Format date to a readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center animate-pulse">
            <div className="h-9 w-9 rounded-full bg-gray-200 mr-3"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    )
  }

  if (sales.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">No recent sales found.</div>
  }

  return (
    <div className="space-y-8">
      {sales.map((sale) => (
        <div key={sale._id} className="flex items-center">
          <Avatar className={`h-9 w-9 ${getAvatarColor(sale.customer)}`}>
            <AvatarFallback>{getInitials(sale.customer)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <Link href={`/sales/${sale._id}`} className="text-sm font-medium leading-none hover:underline">
              {sale.customer}
            </Link>
            <p className="text-sm text-muted-foreground">
              {formatDate(sale.date)} • {sale.status}
            </p>
          </div>
          <div className="ml-auto font-medium">+${sale.total.toFixed(2)}</div>
        </div>
      ))}
    </div>
  )
}

