"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import axios from "axios"

interface ProductProfit {
  _id: string
  productName: string
  category: string
  totalSales: number
  totalRevenue: number
  totalCost: number
  totalProfit: number
  profitMargin: number
}

export function ProductProfit() {
  const [products, setProducts] = useState<ProductProfit[]>([])
  const [filteredProducts, setFilteredProducts] = useState<ProductProfit[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await axios.get("/api/sales/product-profit")

        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          setProducts(response.data.data)
          setFilteredProducts(response.data.data)
        } else {
          setError("Invalid data format received from server")
        }
      } catch (err: any) {
        console.error("Error fetching product profit data:", err)
        setError(err.message || "Failed to load product profit data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(products)
    } else {
      const filtered = products.filter(
        (product) =>
          product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredProducts(filtered)
    }
  }, [searchTerm, products])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Product Profit Analysis</CardTitle>
          <CardDescription>Profit breakdown by product</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-10 w-full bg-gray-200 animate-pulse rounded"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 w-full bg-gray-200 animate-pulse rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Product Profit Analysis</CardTitle>
          <CardDescription>Profit breakdown by product</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-red-50 rounded-md">
            <p className="text-red-500">Error: {error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Profit Analysis</CardTitle>
        <CardDescription>Profit breakdown by product</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            placeholder="Search by product name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Sales</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                  <TableHead className="text-right">Margin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell className="font-medium">{product.productName}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell className="text-right">{product.totalSales}</TableCell>
                      <TableCell className="text-right">${product.totalRevenue.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${product.totalCost.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">${product.totalProfit.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{(product.profitMargin * 100).toFixed(1)}%</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

