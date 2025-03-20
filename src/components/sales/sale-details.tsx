"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import {toast} from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertCircle, CheckCircle, XCircle, TrendingUp, TrendingDown } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Loader2 } from "lucide-react"

type SaleDetailsProps = {
  id: string
}

export function SaleDetails({ id }: SaleDetailsProps) {
  const [sale, setSale] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  

  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchSale = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await axios.get(`/api/sales/${id}`)
        setSale(response.data)
      } catch (error: any) {
        console.error("Error fetching sale:", error)
        setError(error.response?.data?.error || "Failed to load sale details")
        toast.error("Failed to load sale details. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchSale()
  }, [id, toast])

  const handleCancelSale = async () => {
    if (!confirm("Are you sure you want to cancel this sale?")) return

    try {
      await axios.put(`/api/sales/${id}`, {
        status: "Cancelled",
      })

      toast.success("The sale has been cancelled successfully")

      // Refresh the sale data
      const response = await axios.get(`/api/sales/${id}`)
      setSale(response.data)
      router.refresh()
    } catch (error) {
      toast.error("Failed to cancel sale. Please try again.")
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (sale.status === newStatus) return

    try {
      setIsUpdating(true)
      await axios.put(`/api/sales/${sale._id}`, {
        status: newStatus,
      })

      toast.success(`Sale status updated to ${newStatus}`)

      // If changing to Completed, show a special message
      if (newStatus === "Completed" && sale.status === "Pending") {
        toast.success("Inventory has been updated based on this sale")
      }

      // Refresh the sale data
      const response = await axios.get(`/api/sales/${id}`)
      setSale(response.data)
      router.refresh()
    } catch (error) {
      console.error("Error updating sale status:", error)
      toast.error("Failed to update sale status")
    } finally {
      setIsUpdating(false)
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num)
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading sale details...</div>
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

  if (!sale) {
    return <div className="flex justify-center p-8">Sale not found</div>
  }

  const totalProfit = sale.profit || 0
  const profitMargin = sale.subtotal > 0 ? (totalProfit / sale.subtotal) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Invoice #{sale._id}</CardTitle>
                <CardDescription>
                  {new Date(sale.date).toLocaleDateString()} at {new Date(sale.date).toLocaleTimeString()}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={
                    sale.status === "Completed"
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : sale.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                        : "bg-red-100 text-red-800 hover:bg-red-100"
                  }
                >
                  {sale.status}
                </Badge>

                {sale.status !== "Cancelled" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" disabled={isUpdating}>
                        Change Status
                        {isUpdating && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Set Status</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => handleStatusChange("Pending")}
                        disabled={sale.status === "Pending"}
                      >
                        Pending
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusChange("Completed")}
                        disabled={sale.status === "Completed"}
                      >
                        Completed
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusChange("Cancelled")}
                        disabled={sale.status === "Cancelled"}
                        className="text-destructive"
                      >
                        Cancelled
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Customer Information</h3>
                <p>{sale.customer}</p>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium mb-2">Items</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-left">Product</TableHead>
                        <TableHead className="text-left">SKU</TableHead>
                        <TableHead className="text-center">Quantity</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sale.items.map((item: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="text-left">{item.productName}</TableCell>
                          <TableCell className="text-left font-mono text-xs">{item.sku}</TableCell>
                          <TableCell className="text-center">{formatNumber(item.quantity)}</TableCell>
                          <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right">${item.total.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${sale.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>${sale.tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${sale.total.toFixed(2)}</span>
                </div>
              </div>

              {sale.status === "Completed" && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span>Profit/Loss</span>
                      <div className="flex items-center">
                        {totalProfit > 0 ? (
                          <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
                        ) : totalProfit < 0 ? (
                          <TrendingDown className="mr-2 h-4 w-4 text-red-500" />
                        ) : null}
                        <span className={totalProfit > 0 ? "text-green-500" : totalProfit < 0 ? "text-red-500" : ""}>
                          ${totalProfit.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>Profit Margin</span>
                      <span className={profitMargin > 0 ? "text-green-500" : profitMargin < 0 ? "text-red-500" : ""}>
                        {profitMargin.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </>
              )}

              {sale.notes && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium">Notes</h3>
                    <p className="text-sm text-muted-foreground">{sale.notes}</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Payment Method</h3>
              <p className="capitalize">{sale.paymentMethod.replace("-", " ")}</p>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium">Payment Status</h3>
              <div className="flex items-center mt-1">
                {sale.status === "Completed" ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Paid</span>
                  </>
                ) : sale.status === "Pending" ? (
                  <>
                    <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                    <span>Pending</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-500 mr-2" />
                    <span>Cancelled</span>
                  </>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium">Actions</h3>
              <div className="space-y-2 mt-2">
                <Button variant="outline" className="w-full" onClick={() => window.print()}>
                  Print Invoice
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleCancelSale}
                  disabled={sale.status === "Cancelled"}
                >
                  Cancel Sale
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {sale.status === "Pending" && (
        <Alert className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Pending Sale</AlertTitle>
          <AlertDescription>
            This is a pending sale. Inventory will be updated and profit will be calculated when the sale is completed.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

