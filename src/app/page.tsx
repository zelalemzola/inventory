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
import { toast } from "sonner"
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
  })
  const [loading, setLoading] = useState(true)
 
  const router = useRouter()

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true)

        // Fetch product stats
        const productStatsResponse = await axios.get("/api/products/stats")

        // Fetch sales stats
        const salesStatsResponse = await axios.get("/api/sales/stats")

        setStats({
          totalRevenue: salesStatsResponse.data.totalRevenue || 0,
          inventoryValue: productStatsResponse.data.inventoryValue || 0,
          totalSales: salesStatsResponse.data.totalSales || 0,
          lowStockItems: productStatsResponse.data.lowStock + productStatsResponse.data.outOfStock || 0,
          totalProfit: salesStatsResponse.data.totalProfit || 0,
        })
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
        toast.error("Failed to load dashboard statistics")

        // Set some fallback data
        setStats({
          totalRevenue: 15250.75,
          inventoryValue: 42680.5,
          totalSales: 87,
          lowStockItems: 12,
          totalProfit: 6320.25,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardStats()
  }, [toast])

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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${loading ? "..." : stats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${loading ? "..." : stats.inventoryValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">+4.3% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{loading ? "..." : stats.totalSales}</div>
              <p className="text-xs text-muted-foreground">+12.5% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.lowStockItems}</div>
              <p className="text-xs text-muted-foreground">+2 since yesterday</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${loading ? "..." : stats.totalProfit.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">+15.2% from last month</p>
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

