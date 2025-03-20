"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import axios from "axios"

export function ProfitMargin() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await axios.get("/api/sales/category-profit")

        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          // Format the data for the chart
          const formattedData = response.data.data.map((item: any) => ({
            name: item.category,
            margin: (item.profitMargin * 100).toFixed(1),
          }))

          setData(formattedData)
        } else {
          setError("Invalid data format received from server")
        }
      } catch (err: any) {
        console.error("Error fetching profit margin data:", err)
        setError(err.message || "Failed to load profit margin data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center bg-gray-100 rounded-md animate-pulse">
        <p className="text-muted-foreground">Loading chart data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center bg-red-50 rounded-md">
        <p className="text-red-500">Error: {error}</p>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center bg-gray-50 rounded-md">
        <p className="text-muted-foreground">No data available for the chart</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis unit="%" />
        <Tooltip
          formatter={(value) => [`${value}%`, "Profit Margin"]}
          labelFormatter={(label) => `Category: ${label}`}
        />
        <Legend />
        <Bar dataKey="margin" name="Profit Margin %" fill="#10b981" />
      </BarChart>
    </ResponsiveContainer>
  )
}

