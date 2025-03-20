"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import axios from "axios"
import Link from "next/link"

interface Variant {
  _id: string
  name: string
  stock: number
  minStockThreshold: number
}

interface Product {
  _id: string
  name: string
  variants: Variant[]
}

export function StockAlerts() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLowStockProducts = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await axios.get("/api/products", {
          params: {
            lowStock: true,
            limit: 5,
          },
        })

        if (response.data && response.data.success && response.data.data && response.data.data.products) {
          setProducts(response.data.data.products)
        } else {
          setError("Invalid data format received from server")
        }
      } catch (err: any) {
        console.error("Error fetching low stock products:", err)
        setError(err.message || "Failed to load low stock products")
      } finally {
        setIsLoading(false)
      }
    }

    fetchLowStockProducts()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center justify-between animate-pulse">
            <div className="space-y-1">
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
              <div className="h-3 w-24 bg-gray-200 rounded"></div>
            </div>
            <div className="h-8 w-16 bg-gray-200 rounded"></div>
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

  if (products.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">No low stock items found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {products.map((product) => {
        // Find variants with low stock
        const lowStockVariants = product.variants.filter((variant) => variant.stock <= variant.minStockThreshold)

        if (lowStockVariants.length === 0) return null

        return (
          <div key={product._id} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{product.name}</p>
              <div className="text-xs text-muted-foreground">
                {lowStockVariants.map((variant) => (
                  <p key={variant._id}>
                    {variant.name}: {variant.stock} left
                  </p>
                ))}
              </div>
            </div>
            <Link href={`/inventory/${product._id}`}>
              <Button variant="outline" size="sm">
                View
              </Button>
            </Link>
          </div>
        )
      })}
      <div className="pt-2">
        <Link href="/inventory?lowStock=true">
          <Button className="w-full">View All Low Stock Items</Button>
        </Link>
      </div>
    </div>
  )
}

