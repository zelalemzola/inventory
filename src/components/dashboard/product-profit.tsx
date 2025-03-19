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

type ProductProfit = {
  name: string
  profit: number
  sales: number
}

export function ProductProfit() {
  const [data, setData] = useState<ProductProfit[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchProductProfit = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch categories for the dropdown
        const categoriesResponse = await axios.get("/api/products/categories")
        if (categoriesResponse.data) {
          setCategories(categoriesResponse.data)
        }

        // Fetch product profit data
        const response = await axios.get("/api/sales/product-profit", {
          params: { category: selectedCategory !== "all" ? selectedCategory : undefined },
        })

        if (response.data && response.data.productProfit) {
          setData(response.data.productProfit)
        } else {
          throw new Error("Invalid response format")
        }
      } catch (error) {
        console.error("Error fetching product profit data:", error)
        setError("Failed to load product profit data")
        toast({
          title: "Error",
          description: "Failed to load product profit data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProductProfit()
  }, [selectedCategory, toast])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-[350px]">Loading product profit data...</div>
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
        <CardTitle>Product Profit Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
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

        {data.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No product profit data available
          </div>
        ) : (
          <ScrollArea className="h-[350px] pr-4">
            <ResponsiveContainer width="100%" height={sortedData.length * 50 + 50} minHeight={350}>
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

