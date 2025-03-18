"use client"

import { useEffect, useState } from "react"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "@/components/ui/chart"
import axios from "axios"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

type CategoryData = {
    name: string
    value: number
}

export function SalesByCategory() {
    const [data, setData] = useState<CategoryData[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    

    useEffect(() => {
        const fetchSalesByCategory = async () => {
            try {
                setLoading(true)
                setError(null)

                const response = await axios.get("/api/sales/stats")

                if (response.data && response.data.salesByCategory) {
                    // Format the data for the chart
                    const formattedData = response.data.salesByCategory.map((item: any) => ({
                        name: item._id || "Uncategorized",
                        value: item.sales,
                    }))

                    setData(formattedData)
                } else {
                    throw new Error("Invalid response format")
                }
            } catch (error) {
                console.error("Error fetching sales by category:", error)
                setError("Failed to load sales by category data")
            } finally {
                setLoading(false)
            }
        }

        fetchSalesByCategory()
    }, [toast])

    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658"]

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat("en-US").format(num)
    }

    if (loading) {
        return <div className="flex items-center justify-center h-[300px]">Loading sales data...</div>
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
        return <div className="flex items-center justify-center h-[300px]">No sales data available</div>
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${formatNumber(Number(value))}`, "Sales"]} />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    )
}

