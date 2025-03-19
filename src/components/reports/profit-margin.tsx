"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "@/components/ui/chart"
import axios from "axios"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

type CategoryMargin = {
  name: string
  margin: number
}

export function ProfitMargin() {
  const [data, setData] = useState<CategoryMargin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchProfitMargins = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await axios.get("/api/sales/stats")

        if (response.data && response.data.profitMarginByCategory) {
          // Format the data for the chart
          const formattedData = response.data.profitMarginByCategory.map((item: any) => ({
            name: item._id || "Uncategorized",
            margin: Number.parseFloat(item.margin.toFixed(2)),
          }))

          setData(formattedData)
        } else {
          throw new Error("Invalid response format")
        }
      } catch (error) {
        console.error("Error fetching profit margins:", error)
        setError("Failed to load profit margin data")
      } finally {
        setLoading(false)
      }
    }

    fetchProfitMargins()
  }, [toast])

  if (loading) {
    return <div className="flex items-center justify-center h-[300px]">Loading profit margin data...</div>
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

  if (data.length === 0) {
    return <div className="flex items-center justify-center h-[300px]">No profit margin data available</div>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis unit="%" />
        <Tooltip formatter={(value) => [`${value}%`, "Profit Margin"]} />
        <Legend />
        <Bar dataKey="margin" fill="#82ca9d" name="Profit Margin %" />
      </BarChart>
    </ResponsiveContainer>
  )
}

