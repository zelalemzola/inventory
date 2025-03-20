"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import axios from "axios"

interface VariantProfit {
  _id: string
  productId: string
  productName: string
  variantName: string
  category: string
  totalSales: number
  totalRevenue: number
  totalCost: number
  totalProfit: number
  profitMargin: number
}

export function VariantProfit() {
  const [variants, setVariants] = useState<VariantProfit[]>([])
  const [filteredVariants, setFilteredVariants] = useState<VariantProfit[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await axios.get("/api/sales/variant-profit")

        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          setVariants(response.data.data)
          setFilteredVariants(response.data.data)
        } else {
          setError("Invalid data format received from server")
        }
      } catch (err: any) {
        console.error("Error fetching variant profit data:", err)
        setError(err.message || "Failed to load variant profit data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredVariants(variants)
    } else {
      const filtered = variants.filter(
        (variant) =>
          variant.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          variant.variantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          variant.category.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredVariants(filtered)
    }
  }, [searchTerm, variants])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Variant Profit Analysis</CardTitle>
          <CardDescription>Profit breakdown by product variant</CardDescription>
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
          <CardTitle>Variant Profit Analysis</CardTitle>
          <CardDescription>Profit breakdown by product variant</CardDescription>
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
        <CardTitle>Variant Profit Analysis</CardTitle>
        <CardDescription>Profit breakdown by product variant</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            placeholder="Search by product, variant, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Variant</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Sales</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                  <TableHead className="text-right">Margin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVariants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      No variants found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVariants.map((variant) => (
                    <TableRow key={variant._id}>
                      <TableCell className="font-medium">{variant.productName}</TableCell>
                      <TableCell>{variant.variantName}</TableCell>
                      <TableCell>{variant.category}</TableCell>
                      <TableCell className="text-right">{variant.totalSales}</TableCell>
                      <TableCell className="text-right">${variant.totalRevenue.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${variant.totalCost.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">${variant.totalProfit.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{(variant.profitMargin * 100).toFixed(1)}%</TableCell>
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

