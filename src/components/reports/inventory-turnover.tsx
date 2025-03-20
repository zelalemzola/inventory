"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import axios from "axios"

interface TurnoverData {
  productId: string
  productName: string
  category: string
  inventoryValue: number
  totalSales: number
  turnoverRatio: number
}

export function InventoryTurnover() {
  const [data, setData] = useState<TurnoverData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await axios.get("/api/products/turnover")

        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          // Take only top 10 products by turnover ratio
          setData(response.data.data.slice(0, 10))
        } else {
          setError("Invalid data format received from server")
        }
      } catch (err: any) {
        console.error("Error fetching inventory turnover:", err)
        setError(err.message || "Failed to load inventory turnover data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inventory Turnover</CardTitle>
          <CardDescription>How quickly products are selling relative to their inventory value</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="animate-pulse w-full h-full bg-gray-200 rounded-md"></div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inventory Turnover</CardTitle>
          <CardDescription>How quickly products are selling relative to their inventory value</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="p-4 bg-red-50 rounded-md w-full">
            <p className="text-red-500 text-center">Error: {error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inventory Turnover</CardTitle>
          <CardDescription>How quickly products are selling relative to their inventory value</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground">No inventory turnover data available</p>
        </CardContent>
      </Card>
    )
  }

  // Format data for the chart
  const chartData = data.map((item) => ({
    name: item.productName.length > 15 ? item.productName.substring(0, 15) + "..." : item.productName,
    turnover: item.turnoverRatio.toFixed(2),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Turnover</CardTitle>
        <CardDescription>How quickly products are selling relative to their inventory value</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={100} />
            <Tooltip formatter={(value) => [`${value}x`, "Turnover Ratio"]} />
            <Legend />
            <Bar dataKey="turnover" name="Turnover Ratio" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

