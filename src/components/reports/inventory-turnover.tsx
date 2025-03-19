"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "@/components/ui/chart"
import axios from "axios"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

type CategoryTurnover = {
  name: string
  turnover: number
}

export function InventoryTurnover() {
  const [data, setData] = useState<CategoryTurnover[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchInventoryTurnover = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await axios.get("/api/products/turnover")

        if (response.data && response.data.turnoverByCategory) {
          // Format the data for the chart
          const formattedData = response.data.turnoverByCategory.map((item: any) => ({
            name: item._id || "Uncategorized",
            turnover: Number.parseFloat(item.turnover.toFixed(2)),
          }))

          setData(formattedData)
        } else {
          throw new Error("Invalid response format")
        }
      } catch (error) {
        console.error("Error fetching inventory turnover:", error)
        setError("Failed to load inventory turnover data")
      } finally {
        setLoading(false)
      }
    }

    fetchInventoryTurnover()
  }, [toast])

  if (loading) {
    return <div className="flex items-center justify-center h-[300px]">Loading inventory turnover data...</div>
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
    return <div className="flex items-center justify-center h-[300px]">No inventory turnover data available</div>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value) => [`${value}x`, "Turnover Rate"]} />
        <Legend />
        <Bar dataKey="turnover" fill="#8884d8" name="Inventory Turnover" />
      </BarChart>
    </ResponsiveContainer>
  )
}

