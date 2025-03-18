"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import axios from "axios"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

type TopProduct = {
  _id: string
  productName: string
  category: string
  sales: number
}

export function TopProducts() {
  const [products, setProducts] = useState<TopProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await axios.get("/api/sales/stats")

        if (response.data && response.data.topProducts) {
          setProducts(response.data.topProducts)
        } else {
          throw new Error("Invalid response format")
        }
      } catch (error) {
        console.error("Error fetching top products:", error)
        setError("Failed to load top products data")
      } finally {
        setLoading(false)
      }
    }

    fetchTopProducts()
  }, [toast])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(num)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-[300px]">Loading top products data...</div>
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

  if (products.length === 0) {
    return <div className="flex items-center justify-center h-[300px]">No sales data available</div>
  }

  return (
    <div className="space-y-8">
      {products.map((product) => (
        <div key={product._id} className="flex items-center">
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">{product.productName}</p>
            <p className="text-sm text-muted-foreground">
              Category: <Badge variant="outline">{product.category || "Uncategorized"}</Badge>
            </p>
          </div>
          <div className="ml-auto font-medium">{formatNumber(product.sales)}</div>
        </div>
      ))}
    </div>
  )
}

