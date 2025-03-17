"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "@/components/ui/chart"
import axios from "axios"
import { toast } from "sonner"


type CategoryTurnover = {
    name: string
    turnover: number
}

export function InventoryTurnover() {
    const [data, setData] = useState<CategoryTurnover[]>([])
    const [loading, setLoading] = useState(true)
 

    useEffect(() => {
        const fetchInventoryTurnover = async () => {
            try {
                setLoading(true)
                const response = await axios.get("/api/products/turnover")

                if (response.data && response.data.turnoverByCategory) {
                    // Format the data for the chart
                    const formattedData = response.data.turnoverByCategory.map((item: any) => ({
                        name: item._id || "Uncategorized",
                        turnover: Number.parseFloat(item.turnover.toFixed(2)),
                    }))

                    setData(formattedData)
                }
            } catch (error) {
                console.error("Error fetching inventory turnover:", error)
                toast("Failed to load inventory turnover data");

                // Set some fallback data if the API fails
                setData([
                    { name: "Brakes", turnover: 4.2 },
                    { name: "Filters", turnover: 6.8 },
                    { name: "Lighting", turnover: 3.5 },
                    { name: "Ignition", turnover: 5.2 },
                    { name: "Electrical", turnover: 2.8 },
                    { name: "Cooling", turnover: 3.1 },
                    { name: "Fuel System", turnover: 4.5 },
                ])
            } finally {
                setLoading(false)
            }
        }

        fetchInventoryTurnover()
    }, [toast])

    if (loading) {
        return <div className="flex items-center justify-center h-[300px]">Loading inventory turnover data...</div>
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

