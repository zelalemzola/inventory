"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "@/components/ui/chart"
import axios from "axios"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

type VariantProfit = {
  name: string
  profit: number
  sales: number
}

export function VariantProfit() {
  const [data, setData] = useState<VariantProfit[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [products, setProducts] = useState<string[]>([])
  const [selectedProduct, setSelectedProduct] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Fetch categories first
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/api/products/categories")
        if (response.data) {
          setCategories(response.data)
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
        setError("Failed to load categories")
      }
    }

    fetchCategories()
  }, [])

  // Fetch products when category changes
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = selectedCategory !== "all" ? { category: selectedCategory } : {}
        const response = await axios.get("/api/products", { params })

        if (response.data && response.data.products) {
          // Extract unique product names
          const productNames = response.data.products.map((p: any) => p.name)
          setProducts(productNames)

          // Reset selected product when category changes
          setSelectedProduct("all")
        }
      } catch (error) {
        console.error("Error fetching products:", error)
        setError("Failed to load products")
      }
    }

    fetchProducts()
  }, [selectedCategory])

  // Fetch variant profit data when product changes
  useEffect(() => {
    const fetchVariantProfit = async () => {
      try {
        setLoading(true)
        setError(null)

        // Build query parameters
        const params: any = {}
        if (selectedCategory !== "all") {
          params.category = selectedCategory
        }
        if (selectedProduct !== "all") {
          params.product = selectedProduct
        }

        // Fetch sales data to calculate variant profits
        const salesResponse = await axios.get("/api/sales", {
          params: { status: "Completed" },
        })

        if (salesResponse.data && salesResponse.data.sales) {
          const variantProfitMap = new Map()

          // Process sales to extract variant profit
          salesResponse.data.sales.forEach((sale: any) => {
            if (sale.items && sale.items.length > 0) {
              sale.items.forEach((item: any) => {
                // Skip if not matching selected product
                if (selectedProduct !== "all" && item.productName !== selectedProduct) {
                  return
                }

                // Skip if not matching selected category
                // We need to fetch the product to check its category
                if (selectedCategory !== "all") {
                  // This is a simplification - in a real app, you'd include category in the sales item
                  // or do a separate lookup
                  if (!item.category && !item.productCategory) {
                    return
                  }

                  const itemCategory = item.category || item.productCategory
                  if (itemCategory !== selectedCategory) {
                    return
                  }
                }

                const variantName = item.variant ? `${item.productName} (${item.variant})` : item.productName

                if (!variantProfitMap.has(variantName)) {
                  variantProfitMap.set(variantName, {
                    profit: 0,
                    sales: 0,
                  })
                }

                const data = variantProfitMap.get(variantName)
                const itemProfit = (item.price - item.cost) * item.quantity
                data.profit += itemProfit
                data.sales += item.quantity
              })
            }
          })

          // Convert to array format for chart
          const formattedData = Array.from(variantProfitMap.entries())
            .map(([name, values]) => ({
              name,
              profit: values.profit,
              sales: values.sales,
            }))
            .sort((a, b) => b.profit - a.profit)

          setData(formattedData)
        } else {
          setData([])
        }
      } catch (error) {
        console.error("Error fetching variant profit data:", error)
        setError("Failed to load variant profit data")
      } finally {
        setLoading(false)
      }
    }

    fetchVariantProfit()
  }, [selectedCategory, selectedProduct, toast])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-[350px]">Loading variant profit data...</div>
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

  // Sort data by profit (descending)
  const sortedData = [...data].sort((a, b) => b.profit - a.profit)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Variant Profit Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Category</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Product</label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct} disabled={products.length === 0}>
              <SelectTrigger>
                <SelectValue placeholder={products.length === 0 ? "No products available" : "Select product"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {products.map((product) => (
                  <SelectItem key={product} value={product}>
                    {product}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {data.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No variant data available for the selected filters
          </div>
        ) : (
          <ScrollArea className="h-[350px] pr-4">
            <ResponsiveContainer width="100%" height={Math.max(data.length * 50 + 50, 350)} minHeight={350}>
              <BarChart data={sortedData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip
                  formatter={(value) => [`$${formatNumber(Number(value))}`, "Profit"]}
                  labelFormatter={(label) => `Variant: ${label}`}
                />
                <Legend />
                <Bar
                  dataKey="profit"
                  fill={(entry) => (entry.profit >= 0 ? "#8884d8" : "#ff5252")}
                  name="Profit/Loss"
                />
              </BarChart>
            </ResponsiveContainer>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

