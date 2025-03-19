"use client"

import { useEffect, useState } from "react"
import { DollarSign, Package, ShoppingCart, Bell, TrendingUp } from "lucide-react"
import axios from "axios"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/dashboard/overview"
import { RecentSales } from "@/components/dashboard/recent-sales"
import { MainNav } from "@/components/dashboard/main-nav"
import { UserNav } from "@/components/dashboard/user-nav"
import { StockAlerts } from "@/components/dashboard/stock-alerts"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { ProfitMargin } from "@/components/dashboard/profit-margin"
import { ProfitTracking } from "@/components/dashboard/profit-tracking"
import { ProductProfit } from "@/components/dashboard/product-profit"
import { VariantProfit } from "@/components/dashboard/variant-profit"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    inventoryValue: 0,
    totalSales: 0,
    lowStockItems: 0,
    totalProfit: 0,
    revenueChange: 0,
    inventoryChange: 0,
    salesChange: 0,
    lowStockChange: 0,
    profitChange: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log("Fetching dashboard stats...")

        // Fetch product stats - For inventory value and low stock items
        let productStats
        try {
          const productStatsResponse = await axios.get("/api/products/stats")
          console.log("Product stats response:", productStatsResponse.data)
          productStats = productStatsResponse.data
        } catch (err) {
          console.error("Error fetching product stats:", err)
          productStats = { inventoryValue: 0, lowStock: 0, outOfStock: 0, lowStockChange: 0 }
          toast({
            title: "Warning",
            description: "Failed to load product statistics. Some data may be missing.",
            variant: "destructive",
          })
        }

        // Fetch sales stats for current period (last month to now)
        const now = new Date()
        const oneMonthAgo = new Date()
        oneMonthAgo.setMonth(now.getMonth() - 1)

        // Fetch sales stats with retry logic
        let currentSalesStats
        let retries = 0
        const maxRetries = 3

        while (retries < maxRetries) {
          try {
            console.log(`Attempt ${retries + 1} to fetch current sales stats...`)
            const salesStatsResponse = await axios.get("/api/sales/stats", {
              params: {
                startDate: oneMonthAgo.toISOString(),
                endDate: now.toISOString(),
              },
            })
            console.log("Sales stats response:", salesStatsResponse.data)
            currentSalesStats = salesStatsResponse.data
            break // Success, exit the retry loop
          } catch (err) {
            console.error(`Error fetching current sales stats (attempt ${retries + 1}):`, err)
            retries++
            if (retries === maxRetries) {
              currentSalesStats = { totalSales: 0, totalRevenue: 0, totalProfit: 0 }
              toast({
                title: "Warning",
                description: "Failed to load sales statistics after multiple attempts. Some data may be missing.",
                variant: "destructive",
              })
            } else {
              // Wait before retrying (exponential backoff)
              await new Promise((resolve) => setTimeout(resolve, 1000 * retries))
            }
          }
        }

        // Fetch previous period stats for comparison (two months ago to one month ago)
        const twoMonthsAgo = new Date()
        twoMonthsAgo.setMonth(now.getMonth() - 2)

        let previousSalesStats
        try {
          const previousPeriodSalesResponse = await axios.get("/api/sales/stats", {
            params: {
              startDate: twoMonthsAgo.toISOString(),
              endDate: oneMonthAgo.toISOString(),
            },
          })
          console.log("Previous period sales response:", previousPeriodSalesResponse.data)
          previousSalesStats = previousPeriodSalesResponse.data
        } catch (err) {
          console.error("Error fetching previous sales stats:", err)
          previousSalesStats = { totalSales: 0, totalRevenue: 0, totalProfit: 0 }
        }

        // Calculate percentage changes
        const calculatePercentChange = (current: number, previous: number) => {
          if (previous === 0) return current > 0 ? 100 : 0
          return ((current - previous) / previous) * 100
        }

        // Extract values with fallbacks to 0 if undefined
        const currentRevenue = currentSalesStats?.totalRevenue || 0
        const previousRevenue = previousSalesStats?.totalRevenue || 0
        const revenueChange = calculatePercentChange(currentRevenue, previousRevenue)

        const currentSales = currentSalesStats?.totalSales || 0
        const previousSales = previousSalesStats?.totalSales || 0
        const salesChange = calculatePercentChange(currentSales, previousSales)

        const currentProfit = currentSalesStats?.totalProfit || 0
        const previousProfit = previousSalesStats?.totalProfit || 0
        const profitChange = calculatePercentChange(currentProfit, previousProfit)

        // For inventory, we don't have historical data in this example
        const inventoryChange = 0 // Default to 0 if no historical data

        // Set the stats with actual data from responses
        setStats({
          totalRevenue: currentRevenue,
          inventoryValue: productStats?.inventoryValue || 0,
          totalSales: currentSales,
          lowStockItems: (productStats?.lowStock || 0) + (productStats?.outOfStock || 0),
          totalProfit: currentProfit,
          revenueChange,
          inventoryChange,
          salesChange,
          lowStockChange: productStats?.lowStockChange || 0,
          profitChange,
        })

        console.log("Dashboard stats set:", {
          totalRevenue: currentRevenue,
          inventoryValue: productStats?.inventoryValue || 0,
          totalSales: currentSales,
          lowStockItems: (productStats?.lowStock || 0) + (productStats?.outOfStock || 0),
          totalProfit: currentProfit,
          profitChange,
        })
      } catch (error: any) {
        console.error("Error fetching dashboard statistics:", error)
        setError("Failed to load dashboard statistics")
        toast({
          title: "Error",
          description: `Failed to load dashboard statistics: ${error.message || "Unknown error"}`,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardStats()
  }, [toast])

  // Format percentage with + sign for positive values
  const formatPercentage = (value: number) => {
    const sign = value > 0 ? "+" : ""
    return `${sign}${value.toFixed(1)}%`
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <MainNav className="mx-6" />
          <div className="ml-auto flex items-center space-x-4">
            <UserNav />
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => router.push("/sales/new")}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">New Sale</span>
              <span className="sm:hidden">Sale</span>
            </Button>
            <Button variant="outline" onClick={() => router.push("/inventory/new")}>
              <Package className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Add Inventory</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? (
                  <div className="h-7 w-24 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  `$${new Intl.NumberFormat("en-US").format(stats.totalRevenue)}`
                )}
              </div>
              <p className={`text-xs ${stats.revenueChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                {loading ? (
                  <div className="h-4 w-32 bg-gray-200 animate-pulse rounded mt-1"></div>
                ) : (
                  `${formatPercentage(stats.revenueChange)} from last month`
                )}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? (
                  <div className="h-7 w-24 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  `$${new Intl.NumberFormat("en-US").format(stats.inventoryValue)}`
                )}
              </div>
              <p className={`text-xs ${stats.inventoryChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                {loading ? (
                  <div className="h-4 w-32 bg-gray-200 animate-pulse rounded mt-1"></div>
                ) : (
                  `${formatPercentage(stats.inventoryChange)} from last month`
                )}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? (
                  <div className="h-7 w-24 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  `${new Intl.NumberFormat("en-US").format(stats.totalSales)}`
                )}
              </div>
              <p className={`text-xs ${stats.salesChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                {loading ? (
                  <div className="h-4 w-32 bg-gray-200 animate-pulse rounded mt-1"></div>
                ) : (
                  `${formatPercentage(stats.salesChange)} from last month`
                )}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? (
                  <div className="h-7 w-24 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  `${new Intl.NumberFormat("en-US").format(stats.lowStockItems)}`
                )}
              </div>
              <p className={`text-xs ${stats.lowStockChange <= 0 ? "text-green-500" : "text-red-500"}`}>
                {loading ? (
                  <div className="h-4 w-32 bg-gray-200 animate-pulse rounded mt-1"></div>
                ) : (
                  `${stats.lowStockChange > 0 ? "+" : ""}${stats.lowStockChange} since yesterday`
                )}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {loading ? (
                  <div className="h-7 w-24 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  `$${new Intl.NumberFormat("en-US").format(stats.totalProfit)}`
                )}
              </div>
              <p className={`text-xs ${stats.profitChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                {loading ? (
                  <div className="h-4 w-32 bg-gray-200 animate-pulse rounded mt-1"></div>
                ) : (
                  `${formatPercentage(stats.profitChange)} from last month`
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="profit">Profit Analysis</TabsTrigger>
            <TabsTrigger value="products">Product Profit</TabsTrigger>
            <TabsTrigger value="variants">Variant Profit</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Sales Overview</CardTitle>
                  <CardDescription>Compare sales and profit trends over time</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <Overview />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Recent Sales</CardTitle>
                  <CardDescription>Latest transactions processed</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentSales />
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Profit Margin by Category</CardTitle>
                  <CardDescription>Analyze profit margins across product categories</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <ProfitMargin />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Stock Alerts</CardTitle>
                  <CardDescription>Items that need attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <StockAlerts />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profit Timeline</CardTitle>
                <CardDescription>Track profit trends over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ProfitTracking />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <ProductProfit />
          </TabsContent>

          <TabsContent value="variants" className="space-y-4">
            <VariantProfit />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

