"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import axios from "axios"

export function ProfitTracking() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await axios.get("/api/sales/profit-tracking")

        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          setData(response.data.data)
        } else {
          setError("Invalid data format received from server")
        }
      } catch (err: any) {
        console.error("Error fetching profit tracking data:", err)
        setError(err.message || "Failed to load profit tracking data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center bg-gray-100 rounded-md animate-pulse">
        <p className="text-muted-foreground">Loading chart data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center bg-red-50 rounded-md">
        <p className="text-red-500">Error: {error}</p>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center bg-gray-50 rounded-md">
        <p className="text-muted-foreground">No profit tracking data available</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, undefined]} />
        <Legend />
        <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#3b82f6" strokeWidth={2} />
        <Line type="monotone" dataKey="profit" name="Profit" stroke="#10b981" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  )
}

