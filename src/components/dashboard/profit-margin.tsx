"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "@/components/ui/chart"
import axios from "axios"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

type CategoryProfit = {
  name: string
  margin: number
  sales: number
}

export function ProfitMargin() {
  const [data, setData] = useState<CategoryProfit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  

  useEffect(() => {
    const fetchCategoryProfitData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await axios.get("/api/sales/category-profit")

        if (response.data && response.data.categoryProfit) {
          setData(response.data.categoryProfit)
        } else {
          throw new Error("Invalid response format")
        }
      } catch (error) {
        console.error("Error fetching category profit data:", error)
        setError("Failed to load category profit data")
        toast.error("Failed to load category profit data")
      } finally {
        setLoading(false)
      }
    }

    fetchCategoryProfitData()
  }, [toast])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-[350px]">Loading category profit data...</div>
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
    return <div className="flex items-center justify-center h-[350px]">No category profit data available</div>
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(value) => `${value}%`} />
        <Tooltip formatter={(value) => [`${value}%`, "Profit Margin"]} />
        <Legend />
        <Bar dataKey="margin" fill="#8884d8" name="Profit Margin (%)" />
      </BarChart>
    </ResponsiveContainer>
  )
}

