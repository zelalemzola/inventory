"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import axios from "axios"
import { toast } from "sonner"


type TopProduct = {
    _id: string
    productName: string
    category: string
    sales: number
}

export function TopProducts() {
    const [products, setProducts] = useState<TopProduct[]>([])
    const [loading, setLoading] = useState(true)
  

    useEffect(() => {
        const fetchTopProducts = async () => {
            try {
                setLoading(true)
                const response = await axios.get("/api/sales/stats")

                if (response.data && response.data.topProducts) {
                    setProducts(response.data.topProducts)
                }
            } catch (error) {
                console.error("Error fetching top products:", error)
                toast("Failed to load top products data")
            } finally {
                setLoading(false)
            }
        }

        fetchTopProducts()
    }, [toast])

    if (loading) {
        return <div className="flex items-center justify-center h-[300px]">Loading top products data...</div>
    }

    if (products.length === 0) {
        return <div className="flex items-center justify-center h-[300px]">No sales data available</div>
    }

    return (
        <div className="space-y-8">
            {products.map((product) => (
                <div key={product._id} className="flex items-center">
                    <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{product.productName}</p>
                        <p className="text-sm text-muted-foreground">
                            Category: <Badge variant="outline">{product.category || "Uncategorized"}</Badge>
                        </p>
                    </div>
                    <div className="ml-auto font-medium">${product.sales.toFixed(2)}</div>
                </div>
            ))}
        </div>
    )
}

