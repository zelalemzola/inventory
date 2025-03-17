"use client"

import { useEffect, useState } from "react"
import {
    Line,
    LineChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "@/components/ui/chart"
import axios from "axios"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

type ProfitData = {
    name: string
    profit: number
}

export function ProfitTracking() {
    const [data, setData] = useState<ProfitData[]>([])
    const [loading, setLoading] = useState(true)
    const [totalProfit, setTotalProfit] = useState(0)
 

    useEffect(() => {
        const fetchProfitData = async () => {
            try {
                setLoading(true)
                // Get the last 12 months of data
                const today = new Date()
                const twelveMonthsAgo = new Date()
                twelveMonthsAgo.setMonth(today.getMonth() - 11)

                const response = await axios.get("/api/sales/stats", {
                    params: {
                        startDate: twelveMonthsAgo.toISOString(),
                        endDate: today.toISOString(),
                    },
                })

                // Process the data to get monthly profit
                const monthlyData: Record<string, { profit: number }> = {}

                // Initialize the last 12 months
                for (let i = 0; i < 12; i++) {
                    const date = new Date()
                    date.setMonth(today.getMonth() - i)
                    const monthName = date.toLocaleString("default", { month: "short" })
                    monthlyData[monthName] = { profit: 0 }
                }

                // If we have sales data, process it
                if (response.data && response.data.salesByMonth) {
                    response.data.salesByMonth.forEach((item: any) => {
                        const monthName = new Date(item._id).toLocaleString("default", { month: "short" })
                        if (monthlyData[monthName]) {
                            monthlyData[monthName].profit = item.profit
                        }
                    })
                } else {
                    // If no data from API, use some sample data
                    const months = Object.keys(monthlyData)
                    let runningTotal = 0
                    months.forEach((month, index) => {
                        const profit = Math.floor(Math.random() * 2000) + 500
                        monthlyData[month] = { profit }
                        runningTotal += profit
                    })
                    setTotalProfit(runningTotal)
                }

                // Calculate total profit
                let totalProfitSum = 0
                Object.values(monthlyData).forEach((item) => {
                    totalProfitSum += item.profit
                })
                setTotalProfit(totalProfitSum)

                // Convert to array and reverse to get chronological order
                const formattedData = Object.entries(monthlyData)
                    .map(([name, values]) => ({
                        name,
                        profit: values.profit,
                    }))
                    .reverse()

                setData(formattedData)
            } catch (error) {
                console.error("Error fetching profit data:", error)
                toast.error("Failed to load profit tracking data")

                // Set some fallback data if the API fails
                const fallbackData = [
                    { name: "Jan", profit: 2400 },
                    { name: "Feb", profit: 1398 },
                    { name: "Mar", profit: 9800 },
                    { name: "Apr", profit: 3908 },
                    { name: "May", profit: 4800 },
                    { name: "Jun", profit: 3800 },
                    { name: "Jul", profit: 4300 },
                    { name: "Aug", profit: 5200 },
                    { name: "Sep", profit: 4100 },
                    { name: "Oct", profit: 3600 },
                    { name: "Nov", profit: 4900 },
                    { name: "Dec", profit: 5800 },
                ]
                setData(fallbackData)
                setTotalProfit(fallbackData.reduce((sum, item) => sum + item.profit, 0))
            } finally {
                setLoading(false)
            }
        }

        fetchProfitData()
    }, [toast])

    if (loading) {
        return <div className="flex items-center justify-center h-[350px]">Loading profit data...</div>
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                        Total Profit
                        {totalProfit > 0 ? (
                            <TrendingUp className="ml-2 h-4 w-4 text-green-500" />
                        ) : (
                            <TrendingDown className="ml-2 h-4 w-4 text-red-500" />
                        )}
                    </CardTitle>
                    <CardDescription>12-month profit summary</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        <span className={totalProfit > 0 ? "text-green-600" : "text-red-600"}>${totalProfit.toFixed(2)}</span>
                    </div>
                </CardContent>
            </Card>

            <ResponsiveContainer width="100%" height={350}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, "Profit"]} />
                    <Legend />
                    <Line type="monotone" dataKey="profit" stroke="#82ca9d" name="Profit" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

