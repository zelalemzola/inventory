"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "@/components/ui/chart"
import axios from "axios"
import { toast } from "sonner"

type CategoryMargin = {
    name: string
    margin: number
}

export function ProfitMargin() {
    const [data, setData] = useState<CategoryMargin[]>([])
    const [loading, setLoading] = useState(true)
    

    useEffect(() => {
        const fetchProfitMargins = async () => {
            try {
                setLoading(true)
                const response = await axios.get("/api/sales/stats")

                if (response.data && response.data.profitMarginByCategory) {
                    // Format the data for the chart
                    const formattedData = response.data.profitMarginByCategory.map((item: any) => ({
                        name: item._id || "Uncategorized",
                        margin: Number.parseFloat(item.margin.toFixed(2)),
                    }))

                    setData(formattedData)
                } else {
                    // If no data from API, use some sample data
                    setData([
                        { name: "Brakes", margin: 35.5 },
                        { name: "Engine", margin: 42.3 },
                        { name: "Suspension", margin: 28.7 },
                        { name: "Electrical", margin: 45.2 },
                        { name: "Filters", margin: 38.9 },
                    ])
                }
            } catch (error) {
                console.error("Error fetching profit margins:", error)
                toast.error("Failed to load profit margin data")

                // Set some fallback data if the API fails
                setData([
                    { name: "Brakes", margin: 35.5 },
                    { name: "Engine", margin: 42.3 },
                    { name: "Suspension", margin: 28.7 },
                    { name: "Electrical", margin: 45.2 },
                    { name: "Filters", margin: 38.9 },
                ])
            } finally {
                setLoading(false)
            }
        }

        fetchProfitMargins()
    }, [toast])

    if (loading) {
        return <div className="flex items-center justify-center h-[300px]">Loading profit margin data...</div>
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

