"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "@/components/ui/chart"
import axios from "axios"
import { toast } from "sonner"
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
  const [products, setProducts] = useState<string[]>([])
  const [selectedProduct, setSelectedProduct] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  

  useEffect(() => {
    const fetchVariantProfit = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch product list for the dropdown
        const productsResponse = await axios.get("/api/products/categories")
        if (productsResponse.data) {
          // Get unique product names from sales data
          const productNames = await axios.get("/api/sales/product-names")
          if (productNames.data && productNames.data.names) {
            setProducts(productNames.data.names)
          }
        }

        // Fetch variant profit data
        const response = await axios.get("/api/sales/product-profit", {
          params: { product: selectedProduct !== "all" ? selectedProduct : undefined },
        })

        if (response.data && response.data.variantProfit) {
          setData(response.data.variantProfit)
        } else {
          throw new Error("Invalid response format")
        }
      } catch (error) {
        console.error("Error fetching variant profit data:", error)
        setError("Failed to load variant profit data")
      } finally {
        setLoading(false)
      }
    }

    fetchVariantProfit()
  }, [selectedProduct, toast])

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
        <div className="mb-4">
          <Select value={selectedProduct} onValueChange={setSelectedProduct}>
            <SelectTrigger>
              <SelectValue placeholder="Select product" />
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

        {data.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No variant data available for this product
          </div>
        ) : (
          <ScrollArea className="h-[350px] pr-4">
            <ResponsiveContainer width="100%" height={data.length * 50 + 50} minHeight={350}>
              <BarChart data={sortedData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip formatter={(value) => [`$${formatNumber(Number(value))}`, "Profit"]} />
                <Legend />
                <Bar dataKey="profit" fill="#8884d8" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

