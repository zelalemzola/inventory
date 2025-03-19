"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import axios from "axios"
import { Loader2 } from "lucide-react"

export function Overview() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await axios.get("/api/sales/monthly")
        console.log("Monthly sales data:", response.data)

        if (response.data && Array.isArray(response.data)) {
          setData(response.data)
        } else {
          console.error("Invalid monthly sales data format:", response.data)
          setError("Invalid data format received")
        }
      } catch (err) {
        console.error("Error fetching monthly sales data:", err)
        setError("Failed to load monthly sales data")
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
          <p className="text-sm">Sales: {payload[2]?.value || 0}</p>
        </div>
      )
    }

    return null
  }

  return (
    <div className="w-full">
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
          <p>No sales data available</p>
        </div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="revenue" name="Revenue" fill="#2563eb" />
              <Bar dataKey="profit" name="Profit" fill="#16a34a" />
              <Bar dataKey="count" name="Sales" fill="#d97706" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

