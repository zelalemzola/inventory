"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import axios from "axios"
import { Loader2 } from "lucide-react"

interface ProductData {
  name: string
  revenue: number
  count: number
  profit: number
  category: string
}

export function TopProducts() {
  const [data, setData] = useState<ProductData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log("Fetching top products data...")
        const response = await axios.get("/api/products/top")
        console.log("Top products data received:", response.data)

        if (response.data && Array.isArray(response.data)) {
          // Filter out products with zero revenue
          const validData = response.data.filter((item: ProductData) => item.revenue > 0)

          if (validData.length > 0) {
            setData(validData)
          } else {
            console.log("No products with revenue found")
            setData([])
          }
        } else {
          console.error("Invalid top products data format:", response.data)
          setError("Invalid data format received")
        }
      } catch (err: any) {
        console.error("Error fetching top products data:", err)
        setError(`Failed to load top products data: ${err.message || "Unknown error"}`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Custom tooltip for the bar chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-2 border rounded shadow-sm">
          <p className="font-semibold">{label}</p>
          <p className="text-sm text-blue-600">Revenue: ${payload[0]?.value?.toLocaleString() || 0}</p>
          <p className="text-sm text-green-600">Profit: ${payload[1]?.value?.toLocaleString() || 0}</p>
          <p className="text-sm">Items Sold: {payload[2]?.value || 0}</p>
          <p className="text-sm">Category: {payload[0]?.payload?.category || "Unknown"}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Products</CardTitle>
        <CardDescription>Best performing products by revenue</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-80">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-80 text-destructive">
            <p>{error}</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex justify-center items-center h-80 text-muted-foreground">
            <p>No product data available. Try making some sales first.</p>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="#2563eb" />
                <Bar dataKey="profit" name="Profit" fill="#16a34a" />
                <Bar dataKey="count" name="Items Sold" fill="#d97706" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

