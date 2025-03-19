"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

type Product = {
  _id: string
  name: string
  sku: string
  stock: number
  minStockLevel: number
  status: string
  category: string
  variants?: {
    name: string
    sku: string
    stock: number
    minStockLevel?: number
  }[]
}

type AlertItem = {
  _id: string
  name: string
  sku: string
  stock: number
  minStockLevel: number
  status: string
  category: string
  isVariant?: boolean
  parentId?: string
  parentName?: string
}

export function StockAlerts() {
  const [alertItems, setAlertItems] = useState<AlertItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLowStockItems = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/api/products", {
        params: {
          status: "Low Stock,Out of Stock",
          limit: 100,
        },
      })

      const products = response.data.products as Product[]
      const alerts: AlertItem[] = []

      // Process main products
      products.forEach((product) => {
        if (product.status === "Low Stock" || product.status === "Out of Stock") {
          alerts.push({
            _id: product._id,
            name: product.name,
            sku: product.sku,
            stock: product.stock,
            minStockLevel: product.minStockLevel,
            status: product.status,
            category: product.category,
          })
        }

        // Process variants
        if (product.variants && product.variants.length > 0) {
          product.variants.forEach((variant) => {
            const variantStock = variant.stock
            const variantMinStock = variant.minStockLevel || product.minStockLevel

            if (variantStock <= 0 || variantStock <= variantMinStock) {
              const status = variantStock <= 0 ? "Out of Stock" : "Low Stock"

              alerts.push({
                _id: `${product._id}-${variant.sku}`,
                name: variant.name,
                sku: variant.sku,
                stock: variantStock,
                minStockLevel: variantMinStock,
                status: status,
                category: product.category,
                isVariant: true,
                parentId: product._id,
                parentName: product.name,
              })
            }
          })
        }
      })

      // Sort by status (Out of Stock first, then Low Stock) and then by stock level
      alerts.sort((a, b) => {
        if (a.status === b.status) {
          return a.stock - b.stock
        }
        return a.status === "Out of Stock" ? -1 : 1
      })

      setAlertItems(alerts)
    } catch (error) {
      console.error("Error fetching low stock items:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLowStockItems()
  }, [])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num)
  }

  const handleRestock = async (item: AlertItem) => {
    try {
      const quantity = prompt("Enter quantity to restock:", "10")
      if (!quantity) return

      const productId = item.isVariant ? item.parentId : item._id

      if (item.isVariant) {
        // Get the product
        const productResponse = await axios.get(`/api/products/${productId}`)
        const product = productResponse.data

        // Find and update the variant
        const updatedVariants = product.variants.map((v: any) => {
          if (v.name === item.name) {
            return {
              ...v,
              stock: v.stock + Number.parseInt(quantity),
            }
          }
          return v
        })

        // Update the product with the new variants
        await axios.put(`/api/products/${productId}`, {
          ...product,
          variants: updatedVariants,
        })
      } else {
        // Regular product restock
        await axios.post(`/api/products/${item._id}/restock`, {
          quantity: Number.parseInt(quantity),
          notes: `Manual restock of ${quantity} units`,
        })
      }

      toast.success(`Added ${quantity} units to inventory.`)

      // Refresh the alerts
      fetchLowStockItems()
    } catch (error) {
      console.error("Error restocking item:", error)
      toast.error("Failed to restock item. Please try again.")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertCircle className="mr-2 h-5 w-5 text-yellow-500" />
          Stock Alerts
        </CardTitle>
        <CardDescription>Products that need attention</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Loading stock alerts...</div>
        ) : alertItems.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">No stock alerts at this time.</div>
        ) : (
          <div className="space-y-4">
            {alertItems.slice(0, 5).map((item) => (
              <div key={item._id} className="flex items-center justify-between border-b pb-2">
                <div className="flex-1">
                  <Link
                    href={`/inventory/${item.isVariant ? item.parentId : item._id}`}
                    className="font-medium hover:underline"
                  >
                    {item.name}
                  </Link>
                  {item.isVariant && <div className="text-xs text-muted-foreground">Variant of: {item.parentName}</div>}
                  <div className="text-sm text-muted-foreground">
                    SKU: {item.sku} | Category: {item.category}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-sm font-medium">
                    Stock: {formatNumber(item.stock)} / {formatNumber(item.minStockLevel)}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {item.status === "Out of Stock" ? (
                      <Badge variant="destructive">Out of Stock</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                        Low Stock
                      </Badge>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleRestock(item)} className="h-7 px-2">
                      Restock
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {alertItems.length > 5 && (
              <div className="text-center pt-2">
                <Link href="/inventory?status=Low Stock,Out of Stock" className="text-sm text-blue-600 hover:underline">
                  View all {alertItems.length} alerts
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

