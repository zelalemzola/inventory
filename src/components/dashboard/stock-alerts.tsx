"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart, AlertCircle } from "lucide-react"
import axios from "axios"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type Product = {
  _id: string
  name: string
  stock: number
  status: "In Stock" | "Low Stock" | "Out of Stock"
  variant?: string
}

export function StockAlerts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()

  useEffect(() => {
    const fetchLowStockProducts = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch products with low or out of stock status
        const response = await axios.get("/api/products", {
          params: {
            status: ["Low Stock", "Out of Stock"].join(","),
            limit: 5,
            includeVariants: true, // Include variants with low stock
          },
        })

        if (response.data && response.data.products) {
          const lowStockProducts: Product[] = []

          // Process main products
          response.data.products.forEach((product: any) => {
            if (product.status === "Low Stock" || product.status === "Out of Stock") {
              lowStockProducts.push({
                _id: product._id,
                name: product.name,
                stock: product.stock,
                status: product.status,
              })
            }

            // Process variants
            if (product.variants && product.variants.length > 0) {
              product.variants.forEach((variant: any) => {
                const variantStock = variant.stock || 0
                let variantStatus = "In Stock"

                if (variantStock <= 0) {
                  variantStatus = "Out of Stock"
                } else if (variantStock <= 5) {
                  // Using 5 as default threshold for variants
                  variantStatus = "Low Stock"
                }

                if (variantStatus === "Low Stock" || variantStatus === "Out of Stock") {
                  lowStockProducts.push({
                    _id: product._id, // Use parent product ID
                    name: product.name,
                    stock: variantStock,
                    status: variantStatus as "Low Stock" | "Out of Stock",
                    variant: variant.name,
                  })
                }
              })
            }
          })

          // Sort by status (Out of Stock first, then Low Stock)
          lowStockProducts.sort((a, b) => {
            if (a.status === "Out of Stock" && b.status !== "Out of Stock") return -1
            if (a.status !== "Out of Stock" && b.status === "Out of Stock") return 1
            return 0
          })

          // Limit to 5 items
          setProducts(lowStockProducts.slice(0, 5))
        } else {
          setError("Failed to load stock alerts")
        }
      } catch (error) {
        console.error("Error fetching low stock products:", error)
        setError("Failed to load stock alerts")
      } finally {
        setLoading(false)
      }
    }

    fetchLowStockProducts()
  }, [toast])

  const handleRestock = async (productId: string, variant?: string) => {
    try {
      const quantity = prompt("Enter quantity to restock:", "10")
      if (!quantity) return

      if (variant) {
        // Restock a variant
        const productResponse = await axios.get(`/api/products/${productId}`)
        const product = productResponse.data

        // Find and update the variant
        const updatedVariants = product.variants.map((v: any) => {
          if (v.name === variant) {
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

        toast.success(`Added ${quantity} units to ${variant}.`)
      } else {
        // Restock a main product
        await axios.post(`/api/products/${productId}/restock`, {
          quantity: Number.parseInt(quantity),
          notes: `Manual restock of ${quantity} units from dashboard`,
        })

        toast.success(`Added ${quantity} units to inventory.`)
      }

      // Refresh the list
      const response = await axios.get("/api/products", {
        params: {
          status: ["Low Stock", "Out of Stock"].join(","),
          limit: 5,
          includeVariants: true,
        },
      })

      if (response.data && response.data.products) {
        const lowStockProducts: Product[] = []

        // Process main products
        response.data.products.forEach((product: any) => {
          if (product.status === "Low Stock" || product.status === "Out of Stock") {
            lowStockProducts.push({
              _id: product._id,
              name: product.name,
              stock: product.stock,
              status: product.status,
            })
          }

          // Process variants
          if (product.variants && product.variants.length > 0) {
            product.variants.forEach((variant: any) => {
              const variantStock = variant.stock || 0
              let variantStatus = "In Stock"

              if (variantStock <= 0) {
                variantStatus = "Out of Stock"
              } else if (variantStock <= 5) {
                variantStatus = "Low Stock"
              }

              if (variantStatus === "Low Stock" || variantStatus === "Out of Stock") {
                lowStockProducts.push({
                  _id: product._id,
                  name: product.name,
                  stock: variantStock,
                  status: variantStatus as "Low Stock" | "Out of Stock",
                  variant: variant.name,
                })
              }
            })
          }
        })

        // Sort and limit
        lowStockProducts.sort((a, b) => {
          if (a.status === "Out of Stock" && b.status !== "Out of Stock") return -1
          if (a.status !== "Out of Stock" && b.status === "Out of Stock") return 1
          return 0
        })

        setProducts(lowStockProducts.slice(0, 5))
      }

      // Refresh the page to update other components
      router.refresh()
    } catch (error) {
      toast.error("Failed to restock product. Please try again.")
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-[300px]">Loading stock alerts...</div>
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
    return <div className="text-center py-8 text-muted-foreground">No stock alerts found.</div>
  }

  return (
    <div className="space-y-4">
      {products.map((product, index) => (
        <div key={`${product._id}-${product.variant || ""}-${index}`} className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">
              {product.name}
              {product.variant && <span className="text-muted-foreground"> ({product.variant})</span>}
            </p>
            <div className="flex items-center pt-2">
              {product.status === "Low Stock" && (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                  Low Stock ({formatNumber(product.stock)})
                </Badge>
              )}
              {product.status === "Out of Stock" && <Badge variant="destructive">Out of Stock</Badge>}
            </div>
          </div>
          <Button size="sm" onClick={() => handleRestock(product._id, product.variant)}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Restock
          </Button>
        </div>
      ))}
    </div>
  )
}

