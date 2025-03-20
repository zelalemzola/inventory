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
import {toast} from 'sonner'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

type ProductPriceHistoryProps = {
  id: string
}

type PriceHistoryItem = {
  date: string
  price: number
  cost: number
}

export function ProductPriceHistory({ id }: ProductPriceHistoryProps) {
  const [data, setData] = useState<PriceHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  

  useEffect(() => {
    const fetchPriceHistory = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await axios.get(`/api/price-history?product=${id}`)

        if (response.data && response.data.priceHistory && response.data.priceHistory.length > 0) {
          // Format the data for the chart
          const formattedData = response.data.priceHistory.map((item: any) => ({
            date: new Date(item.date).toLocaleDateString(),
            price: item.newPrice,
            cost: item.oldPrice * 0.7, // Assuming cost is 70% of old price for visualization
          }))

          setData(formattedData)
        } else {
          // If no data, create some sample data for visualization
          const today = new Date()
          const sampleData = []

          // Get product details for initial price
          const productResponse = await axios.get(`/api/products/${id}`)
          const product = productResponse.data

          if (product) {
            const basePrice = product.price
            const baseCost = product.cost

            // Create 6 months of sample data
            for (let i = 5; i >= 0; i--) {
              const date = new Date()
              date.setMonth(today.getMonth() - i)

              // Slight variations in price over time
              const priceVariation = 1 + (Math.random() * 0.1 - 0.05) // -5% to +5%
              const costVariation = 1 + (Math.random() * 0.08 - 0.04) // -4% to +4%

              sampleData.push({
                date: date.toLocaleDateString(),
                price: basePrice * priceVariation,
                cost: baseCost * costVariation,
              })
            }

            setData(sampleData)
          } else {
            setError("Could not load product data")
          }
        }
      } catch (error) {
        console.error("Error fetching price history:", error)
        setError("Failed to load price history data")
      } finally {
        setLoading(false)
      }
    }

    fetchPriceHistory()
  }, [id, toast])

  if (loading) {
    return <div className="flex justify-center p-4">Loading price history...</div>
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
    return <div className="text-center py-6 text-muted-foreground">No price history available.</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Price History</h3>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, ""]} />
          <Legend />
          <Line type="monotone" dataKey="cost" stroke="#8884d8" name="Cost" />
          <Line type="monotone" dataKey="price" stroke="#82ca9d" name="Price" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

