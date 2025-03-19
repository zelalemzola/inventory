"use client"

import { useEffect, useState } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "@/components/ui/chart"
import axios from "axios"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type ProfitData = {
  name: string
  profit: number
  revenue: number
}

export function ProfitTracking() {
  const [data, setData] = useState<ProfitData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<string>("month")
  const { toast } = useToast()

  const fetchProfitData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Calculate date range based on selected time range
      const endDate = new Date()
      const startDate = new Date()

      if (timeRange === "week") {
        startDate.setDate(endDate.getDate() - 7)
      } else if (timeRange === "month") {
        startDate.setMonth(endDate.getMonth() - 1)
      } else if (timeRange === "quarter") {
        startDate.setMonth(endDate.getMonth() - 3)
      } else if (timeRange === "year") {
        startDate.setFullYear(endDate.getFullYear() - 1)
      }

      const response = await axios.get("/api/sales/profit-tracking", {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          interval: timeRange,
        },
      })

      if (response.data && response.data.profitData) {
        setData(response.data.profitData)
      } else {
        // Create API endpoint if it doesn't exist
        const salesResponse = await axios.get("/api/sales", {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            status: "Completed",
          },
        })

        if (salesResponse.data && salesResponse.data.sales) {
          // Process sales data to create profit tracking data
          const salesByDate = new Map()

          salesResponse.data.sales.forEach((sale: any) => {
            const date = new Date(sale.date)
            let dateKey

            if (timeRange === "week") {
              dateKey = date.toLocaleDateString()
            } else if (timeRange === "month" || timeRange === "quarter") {
              dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
            } else {
              dateKey = date.toLocaleString("default", { month: "short" }) + " " + date.getFullYear()
            }

            if (!salesByDate.has(dateKey)) {
              salesByDate.set(dateKey, { revenue: 0, profit: 0 })
            }

            const data = salesByDate.get(dateKey)
            data.revenue += sale.total || 0
            data.profit += sale.profit || 0
          })

          // Convert to array format for chart
          const formattedData = Array.from(salesByDate.entries())
            .map(([date, values]) => ({
              name: date,
              revenue: values.revenue,
              profit: values.profit,
            }))
            .sort((a, b) => a.name.localeCompare(b.name))

          setData(formattedData)
        } else {
          setData([])
        }
      }
    } catch (error) {
      console.error("Error fetching profit tracking data:", error)
      setError("Failed to load profit tracking data")
      toast({
        title: "Error",
        description: "Failed to load profit tracking data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfitData()
  }, [timeRange, toast])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-[350px]">Loading profit tracking data...</div>
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
    return <div className="flex items-center justify-center h-[350px]">No profit tracking data available</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last 7 Days</SelectItem>
            <SelectItem value="month">Last 30 Days</SelectItem>
            <SelectItem value="quarter">Last 3 Months</SelectItem>
            <SelectItem value="year">Last 12 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value) => [`$${formatNumber(Number(value))}`, ""]} />
          <Legend />
          <Area type="monotone" dataKey="revenue" fill="#8884d8" stroke="#8884d8" name="Revenue" />
          <Area type="monotone" dataKey="profit" fill="#82ca9d" stroke="#82ca9d" name="Profit" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

