"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "@/components/ui/chart"
import axios from "axios"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

type ProductProfit = {
  name: string
  profit: number
  sales: number
}

export function ProductProfit() {
  const [data, setData] = useState<ProductProfit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProductProfit = async () => {
      try {
        setLoading(true)
        const response = await axios.get("/api/sales/product-profit")

        if (response.data && response.data.productProfit) {
          setData(response.data.productProfit)
        } else {
          // If no data from API, use some sample data
          setData([
            { name: "Brake Pads", profit: 1250, sales: 25 },
            { name: "Oil Filters", profit: 850, sales: 42 },
            { name: "Spark Plugs", profit: 1100, sales: 35 },
            { name: "Air Filters", profit: 750, sales: 30 },
            { name: "Wiper Blades", profit: 600, sales: 28 },
            { name: "Headlight Bulbs", profit: 950, sales: 22 },
            { name: "Batteries", profit: 1500, sales: 15 },
            { name: "Alternators", profit: 1800, sales: 10 },
            { name: "Starters", profit: 1650, sales: 8 },
            { name: "Radiators", profit: 1400, sales: 12 },
          ])
        }
      } catch (error) {
        console.error("Error fetching product profit data:", error)
        toast.error("Failed to load product profit data")

        // Set some fallback data if the API fails
        setData([
          { name: "Brake Pads", profit: 1250, sales: 25 },
          { name: "Oil Filters", profit: 850, sales: 42 },
          { name: "Spark Plugs", profit: 1100, sales: 35 },
          { name: "Air Filters", profit: 750, sales: 30 },
          { name: "Wiper Blades", profit: 600, sales: 28 },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchProductProfit()
  }, [toast])

  if (loading) {
    return <div className="flex items-center justify-center h-[350px]">Loading product profit data...</div>
  }

  // Sort data by profit (descending)
  const sortedData = [...data].sort((a, b) => b.profit - a.profit)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Profit Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px] pr-4">
          <ResponsiveContainer width="100%" height={data.length * 50 + 50} minHeight={350}>
            <BarChart data={sortedData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip formatter={(value) => [`$${value}`, "Profit"]} />
              <Legend />
              <Bar dataKey="profit" fill="#82ca9d" name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

