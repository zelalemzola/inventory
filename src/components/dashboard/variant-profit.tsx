"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "@/components/ui/chart"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type VariantProfit = {
    name: string
    profit: number
    sales: number
}

export function VariantProfit() {
    const [data, setData] = useState<VariantProfit[]>([])
    const [products, setProducts] = useState<string[]>([])
    const [selectedProduct, setSelectedProduct] = useState<string>("all")
    const [loading, setLoading] = useState(true)
   

    useEffect(() => {
        const fetchVariantProfit = async () => {
            try {
                setLoading(true)

                // In a real implementation, you would have an API endpoint for this
                // For now, we'll use sample data
                const sampleProducts = ["Brake Pads", "Oil Filters", "Spark Plugs", "Air Filters", "Wiper Blades"]
                setProducts(sampleProducts)

                const sampleData: Record<string, VariantProfit[]> = {
                    "Brake Pads": [
                        { name: "Front Brake Pads", profit: 650, sales: 15 },
                        { name: "Rear Brake Pads", profit: 450, sales: 12 },
                        { name: "Performance Brake Pads", profit: 850, sales: 8 },
                    ],
                    "Oil Filters": [
                        { name: "Standard Oil Filter", profit: 350, sales: 25 },
                        { name: "Premium Oil Filter", profit: 500, sales: 17 },
                    ],
                    "Spark Plugs": [
                        { name: "Copper Spark Plugs", profit: 250, sales: 20 },
                        { name: "Platinum Spark Plugs", profit: 400, sales: 15 },
                        { name: "Iridium Spark Plugs", profit: 550, sales: 10 },
                    ],
                    "Air Filters": [
                        { name: "Standard Air Filter", profit: 300, sales: 18 },
                        { name: "Performance Air Filter", profit: 450, sales: 12 },
                    ],
                    "Wiper Blades": [
                        { name: "Standard Wiper Blades", profit: 200, sales: 15 },
                        { name: "Premium Wiper Blades", profit: 350, sales: 10 },
                        { name: "All-Weather Wiper Blades", profit: 400, sales: 8 },
                    ],
                }

                // If "all" is selected, combine all variants
                if (selectedProduct === "all") {
                    const allVariants: VariantProfit[] = []
                    Object.values(sampleData).forEach((variants) => {
                        allVariants.push(...variants)
                    })
                    setData(allVariants)
                } else {
                    setData(sampleData[selectedProduct] || [])
                }
            } catch (error) {
                console.error("Error fetching variant profit data:", error)
                toast.error("Failed to load variant profit data")

                // Set some fallback data if the API fails
                setData([
                    { name: "Front Brake Pads", profit: 650, sales: 15 },
                    { name: "Rear Brake Pads", profit: 450, sales: 12 },
                    { name: "Performance Brake Pads", profit: 850, sales: 8 },
                ])
            } finally {
                setLoading(false)
            }
        }

        fetchVariantProfit()
    }, [selectedProduct, toast])

    if (loading) {
        return <div className="flex items-center justify-center h-[350px]">Loading variant profit data...</div>
    }

    // Sort data by profit (descending)
    const sortedData = [...data].sort((a, b) => b.profit - a.profit)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Variant Profit Analysis</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Products</SelectItem>
                            {products.map((product) => (
                                <SelectItem key={product} value={product}>
                                    {product}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {data.length === 0 ? (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        No variant data available for this product
                    </div>
                ) : (
                    <ScrollArea className="h-[350px] pr-4">
                        <ResponsiveContainer width="100%" height={data.length * 50 + 50} minHeight={350}>
                            <BarChart data={sortedData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={150} />
                                <Tooltip formatter={(value) => [`$${value}`, "Profit"]} />
                                <Legend />
                                <Bar dataKey="profit" fill="#8884d8" name="Profit" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    )
}

