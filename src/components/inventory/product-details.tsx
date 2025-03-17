"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {toast} from 'sonner'
import axios from "axios"
import { Edit, ShoppingCart } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

type ProductDetailsProps = {
    id: string
}

export function ProductDetails({ id }: ProductDetailsProps) {
    const [product, setProduct] = useState<any>(null)
    const [loading, setLoading] = useState(true)
  
    const router = useRouter()

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true)
                const response = await axios.get(`/api/products/${id}`)
                setProduct(response.data)
            } catch (error) {
                toast.error("Failed to fetch product details. Please try again.")
            } finally {
                setLoading(false)
            }
        }

        fetchProduct()
    }, [id, toast])

    const handleRestock = async () => {
        try {
            const quantity = prompt("Enter quantity to restock:", "10")
            if (!quantity) return

            await axios.post(`/api/products/${id}/restock`, {
                quantity: Number.parseInt(quantity),
                notes: `Manual restock of ${quantity} units`,
            })

            toast.success(`Added ${quantity} units to inventory.`)

            // Refresh product data
            const response = await axios.get(`/api/products/${id}`)
            setProduct(response.data)
        } catch (error) {
            toast.error("Failed to restock product. Please try again.")
        }
    }

    if (loading) {
        return <div className="flex justify-center p-8">Loading product details...</div>
    }

    if (!product) {
        return <div className="flex justify-center p-8">Product not found</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{product.name}</h2>
                <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => router.push(`/inventory/${id}/edit`)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                    <Button onClick={handleRestock}>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Restock
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="details">
                <TabsList>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="variants">Variants</TabsTrigger>
                    <TabsTrigger value="price-history">Price History</TabsTrigger>
                    <TabsTrigger value="stock-history">Stock History</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-6 pt-4">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex justify-center md:w-1/3">
                            <Image
                                src="/placeholder.svg?height=300&width=300"
                                alt={product.name}
                                width={200}
                                height={200}
                                className="rounded-md object-contain"
                            />
                        </div>

                        <div className="space-y-4 md:w-2/3">
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold">{product.name}</h3>
                                <p className="text-sm text-muted-foreground">{product.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Category</p>
                                    <p className="font-medium">{product.category}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">SKU</p>
                                    <p className="font-mono font-medium">{product.sku}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Price</p>
                                    <p className="font-medium">${product.price.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Cost</p>
                                    <p className="font-medium">${product.cost.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Profit Margin</p>
                                    <p className="font-medium">{(((product.price - product.cost) / product.price) * 100).toFixed(2)}%</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Stock</p>
                                    <div className="flex items-center">
                                        <p className="font-medium mr-2">{product.stock}</p>
                                        {product.status === "In Stock" && (
                                            <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                                                In Stock
                                            </Badge>
                                        )}
                                        {product.status === "Low Stock" && (
                                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                                                Low Stock
                                            </Badge>
                                        )}
                                        {product.status === "Out of Stock" && <Badge variant="destructive">Out of Stock</Badge>}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Min Stock Level</p>
                                    <p className="font-medium">{product.minStockLevel}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Location</p>
                                    <p className="font-medium">{product.location || "Not specified"}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Supplier</p>
                                    <p className="font-medium">{product.supplier || "Not specified"}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Last Restocked</p>
                                    <p className="font-medium">{new Date(product.lastRestocked).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="variants" className="pt-4">
                    {product.variants && product.variants.length > 0 ? (
                        <div className="space-y-4">
                            {product.variants.map((variant: any, index: number) => (
                                <Card key={variant._id || index}>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">{variant.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-muted-foreground">SKU</p>
                                                <p className="font-mono font-medium">{variant.sku}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Stock</p>
                                                <p className="font-medium">{variant.stock}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Price</p>
                                                <p className="font-medium">${variant.price.toFixed(2)}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Cost</p>
                                                <p className="font-medium">${variant.cost.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-6 text-muted-foreground">No variants available for this product.</div>
                    )}
                </TabsContent>

                <TabsContent value="price-history" className="pt-4">
                    <PriceHistoryList productId={id} />
                </TabsContent>

                <TabsContent value="stock-history" className="pt-4">
                    <StockHistoryList productId={id} />
                </TabsContent>
            </Tabs>
        </div>
    )
}

function PriceHistoryList({ productId }: { productId: string }) {
    const [priceHistory, setPriceHistory] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
 

    useEffect(() => {
        const fetchPriceHistory = async () => {
            try {
                setLoading(true)
                const response = await axios.get(`/api/price-history?product=${productId}`)
                setPriceHistory(response.data.priceHistory)
            } catch (error) {
                toast.error("Failed to fetch price history. Please try again.")
            } finally {
                setLoading(false)
            }
        }

        fetchPriceHistory()
    }, [productId, toast])

    if (loading) {
        return <div className="text-center p-4">Loading price history...</div>
    }

    if (priceHistory.length === 0) {
        return <div className="text-center p-6 text-muted-foreground">No price history available.</div>
    }

    return (
        <div className="space-y-4">
            {priceHistory.map((record) => (
                <Card key={record._id}>
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(record.date).toLocaleDateString()} at {new Date(record.date).toLocaleTimeString()}
                                </p>
                                <p className="font-medium">
                                    Price changed from ${record.oldPrice.toFixed(2)} to ${record.newPrice.toFixed(2)}
                                </p>
                                {record.reason && <p className="text-sm mt-1">{record.reason}</p>}
                            </div>
                            <div className="text-right">
                                <p className={record.newPrice > record.oldPrice ? "text-green-600" : "text-red-600"}>
                                    {record.newPrice > record.oldPrice ? "+" : ""}${(record.newPrice - record.oldPrice).toFixed(2)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {(((record.newPrice - record.oldPrice) / record.oldPrice) * 100).toFixed(2)}%
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

function StockHistoryList({ productId }: { productId: string }) {
    const [stockHistory, setStockHistory] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
 

    useEffect(() => {
        const fetchStockHistory = async () => {
            try {
                setLoading(true)
                const response = await axios.get(`/api/stock-history?product=${productId}`)
                setStockHistory(response.data.stockHistory)
            } catch (error) {
                toast.error("Failed to fetch stock history. Please try again.")
            } finally {
                setLoading(false)
            }
        }

        fetchStockHistory()
    }, [productId, toast])

    if (loading) {
        return <div className="text-center p-4">Loading stock history...</div>
    }

    if (stockHistory.length === 0) {
        return <div className="text-center p-6 text-muted-foreground">No stock history available.</div>
    }

    return (
        <div className="space-y-4">
            {stockHistory.map((record) => (
                <Card key={record._id}>
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(record.date).toLocaleDateString()} at {new Date(record.date).toLocaleTimeString()}
                                </p>
                                <p className="font-medium">
                                    {record.type}: Stock changed from {record.previousStock} to {record.newStock}
                                </p>
                                {record.notes && <p className="text-sm mt-1">{record.notes}</p>}
                            </div>
                            <div className="text-right">
                                <p className={record.change > 0 ? "text-green-600" : record.change < 0 ? "text-red-600" : ""}>
                                    {record.change > 0 ? "+" : ""}
                                    {record.change}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

