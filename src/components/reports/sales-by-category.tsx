"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import axios from "axios"
import { Loader2 } from "lucide-react"

interface CategoryData {
  name: string
  revenue: number
  count: number
}

export function SalesByCategory() {
  const [data, setData] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Define colors for the pie chart
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
    "#A4DE6C",
    "#D0ED57",
    "#FFC658",
    "#FF7300",
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log("Fetching sales by category data...")
        const response = await axios.get("/api/sales/by-category")
        console.log("Sales by category data received:", response.data)

        if (response.data && Array.isArray(response.data)) {
          // Filter out categories with zero revenue
          const validData = response.data.filter((item: CategoryData) => item.revenue > 0)

          if (validData.length > 0) {
            setData(validData)
          } else {
            console.log("No categories with revenue found")
            setData([])
          }
        } else {
          console.error("Invalid sales by category data format:", response.data)
          setError("Invalid data format received")
        }
      } catch (err: any) {
        console.error("Error fetching sales by category data:", err)
        setError(`Failed to load sales by category data: ${err.message || "Unknown error"}`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Custom tooltip for the pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background p-2 border rounded shadow-sm">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm">Revenue: ${data.revenue.toLocaleString()}</p>
          <p className="text-sm">Items Sold: {data.count}</p>
        </div>
      )
    }
    return null
  }

  // Format the data for the legend
  const renderLegend = (props: any) => {
    const { payload } = props

    return (
      <ul className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <li key={`item-${index}`} className="flex items-center">
            <div className="w-3 h-3 mr-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-xs">{entry.value}</span>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales by Category</CardTitle>
        <CardDescription>Revenue distribution across product categories</CardDescription>
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
            <p>No category data available. Try making some sales first.</p>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                  nameKey="name"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={renderLegend} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

