import type { Metadata } from "next"
import { MainNav } from "@/components/dashboard/main-nav"
import { Search } from "@/components/dashboard/search"
import { UserNav } from "@/components/dashboard/user-nav"
import { Button } from "@/components/ui/button"
import { Download, Filter } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DateRangePicker } from "@/components/date-range-picker"
import { SalesByCategory } from "@/components/reports/sales-by-category"
import { ProfitMargin } from "@/components/reports/profit-margin"
import { InventoryTurnover } from "@/components/reports/inventory-turnover"
import { TopProducts } from "@/components/reports/top-products"

export const metadata: Metadata = {
    title: "Reports | AutoParts",
    description: "Analyze your business performance",
}

export default function ReportsPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <div className="border-b">
                <div className="flex h-16 items-center px-4">
                    <MainNav className="mx-6" />
                    <div className="ml-auto flex items-center space-x-4">
                        <Search />
                        <UserNav />
                    </div>
                </div>
            </div>
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                    <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
                    <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-x-2 md:space-y-0">
                        <DateRangePicker />
                        <Button variant="outline">
                            <Filter className="mr-2 h-4 w-4" />
                            Filter
                        </Button>
                        <Button>
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="sales">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="sales">Sales</TabsTrigger>
                        <TabsTrigger value="profit">Profit & Loss</TabsTrigger>
                        <TabsTrigger value="inventory">Inventory</TabsTrigger>
                        <TabsTrigger value="performance">Performance</TabsTrigger>
                    </TabsList>
                    <TabsContent value="sales" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                            <Card className="col-span-1">
                                <CardHeader>
                                    <CardTitle>Sales by Category</CardTitle>
                                    <CardDescription>Distribution of sales across product categories</CardDescription>
                                </CardHeader>
                                <CardContent className="pl-2">
                                    <SalesByCategory />
                                </CardContent>
                            </Card>
                            <Card className="col-span-1">
                                <CardHeader>
                                    <CardTitle>Top Selling Products</CardTitle>
                                    <CardDescription>Products with highest sales volume</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <TopProducts />
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                    <TabsContent value="profit" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                            <Card className="col-span-1">
                                <CardHeader>
                                    <CardTitle>Profit Margin by Category</CardTitle>
                                    <CardDescription>Profit margins across different product categories</CardDescription>
                                </CardHeader>
                                <CardContent className="pl-2">
                                    <ProfitMargin />
                                </CardContent>
                            </Card>
                            <Card className="col-span-1">
                                <CardHeader>
                                    <CardTitle>Profit Trend</CardTitle>
                                    <CardDescription>Profit trends over selected time period</CardDescription>
                                </CardHeader>
                                <CardContent>{/* Profit trend chart will go here */}</CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                    <TabsContent value="inventory" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                            <Card className="col-span-1">
                                <CardHeader>
                                    <CardTitle>Inventory Turnover</CardTitle>
                                    <CardDescription>Rate at which inventory is sold and replaced</CardDescription>
                                </CardHeader>
                                <CardContent className="pl-2">
                                    <InventoryTurnover />
                                </CardContent>
                            </Card>
                            <Card className="col-span-1">
                                <CardHeader>
                                    <CardTitle>Stock Level Analysis</CardTitle>
                                    <CardDescription>Current stock levels by category</CardDescription>
                                </CardHeader>
                                <CardContent>{/* Stock level chart will go here */}</CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                    <TabsContent value="performance" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                            <Card className="col-span-1">
                                <CardHeader>
                                    <CardTitle>Sales Performance</CardTitle>
                                    <CardDescription>Sales performance over time</CardDescription>
                                </CardHeader>
                                <CardContent className="pl-2">{/* Sales performance chart will go here */}</CardContent>
                            </Card>
                            <Card className="col-span-1">
                                <CardHeader>
                                    <CardTitle>Profit Performance</CardTitle>
                                    <CardDescription>Profit performance over time</CardDescription>
                                </CardHeader>
                                <CardContent>{/* Profit performance chart will go here */}</CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

