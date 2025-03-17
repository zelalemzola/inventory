"use client"

import { useEffect, useState } from "react"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "@/components/ui/chart"
import axios from "axios"
import { toast } from "sonner"

type CategoryData = {
    name: string
    value: number
}

export function SalesByCategory() {
    const [data, setData] = useState<CategoryData[]>([])
    const [loading, setLoading] = useState(true)
    

    useEffect(() => {
        const fetchSalesByCategory = async () => {
            try {
                setLoading(true)
                const response = await axios.get("/api/sales/stats")

                if (response.data && response.data.salesByCategory) {
                    // Format the data for the chart
                    const formattedData = response.data.salesByCategory.map((item: any) => ({
                        name: item._id || "Uncategorized",
                        value: item.sales,
                    }))

                    setData(formattedData)
                }
            } catch (error) {
                console.error("Error fetching sales by category:", error)
                toast("Failed to load sales by category data")

                // Set some fallback data if the API fails
                setData([{ name: "No Data", value: 100 }])
            } finally {
                setLoading(false)
            }
        }

        fetchSalesByCategory()
    }, [toast])

    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658"]

    if (loading) {
        return <div className="flex items-center justify-center h-[300px]">Loading sales data...</div>
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
                    label={({ name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip formatter={(value:any) => [`$${value}`, "Sales"]} />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    )
}

