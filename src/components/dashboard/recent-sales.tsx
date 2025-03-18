"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import axios from "axios"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

type RecentSale = {
  _id: string
  customer: string
  total: number
  date: string
  status: "Completed" | "Pending" | "Cancelled"
}

export function RecentSales() {
  const [sales, setSales] = useState<RecentSale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
 
  useEffect(() => {
    const fetchRecentSales = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await axios.get("/api/sales", {
          params: {
            limit: 5,
            sort: "date",
            order: "desc",
          },
        })

        if (response.data && response.data.sales) {
          setSales(response.data.sales)
        } else {
          throw new Error("Invalid response format")
        }
      } catch (error) {
        console.error("Error fetching recent sales:", error)
        setError("Failed to load recent sales")
        toast.error("Failed to load recent sales")
      } finally {
        setLoading(false)
      }
    }

    fetchRecentSales()
  }, [toast])

  if (loading) {
    return <div className="flex items-center justify-center h-[300px]">Loading recent sales...</div>
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

  if (sales.length === 0) {
    return <div className="flex items-center justify-center h-[300px]">No recent sales found</div>
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getRandomColor = (name: string) => {
    const colors = [
      "bg-red-500",
      "bg-green-500",
      "bg-blue-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num)
  }

  return (
    <div className="space-y-8">
      {sales.map((sale) => (
        <div key={sale._id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback className={getRandomColor(sale.customer)}>{getInitials(sale.customer)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <Link href={`/sales/${sale._id}`} className="text-sm font-medium leading-none hover:underline">
              {sale.customer}
            </Link>
            <p className="text-sm text-muted-foreground">
              {new Date(sale.date).toLocaleDateString()} - {sale.status}
            </p>
          </div>
          <div className="ml-auto font-medium">${formatNumber(sale.total)}</div>
        </div>
      ))}
    </div>
  )
}

