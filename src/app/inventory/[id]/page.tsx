import type { Metadata } from "next"
import { MainNav } from "@/components/dashboard/main-nav"
import { UserNav } from "@/components/dashboard/user-nav"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Trash, Package, History } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductDetails } from "@/components/inventory/product-details"
import { ProductVariants } from "@/components/inventory/product-variants"
import { ProductPriceHistory } from "@/components/inventory/product-price-history"
import { ProductSalesHistory } from "@/components/inventory/product-sales-history"
import Link from "next/link"

export const metadata: Metadata = {
    title: "Product Details | AutoParts",
    description: "View and manage product details",
}

export default function ProductDetailsPage({ params }: { params: any }) {
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
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/inventory">
                                <ArrowLeft className="h-4 w-4" />
                                <span className="sr-only">Back</span>
                            </Link>
                        </Button>
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Product Details</h2>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" asChild>
                            <Link href={`/inventory/${params.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                        <Button variant="destructive">
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle>Product Information</CardTitle>
                            <CardDescription>Basic product details and information</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ProductDetails id={params.id} />
                        </CardContent>
                    </Card>

                    <div className="md:col-span-2">
                        <Tabs defaultValue="variants">
                            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
                                <TabsTrigger value="variants">
                                    <Package className="mr-2 h-4 w-4" />
                                    Variants
                                </TabsTrigger>
                                <TabsTrigger value="price-history">
                                    <History className="mr-2 h-4 w-4" />
                                    Price History
                                </TabsTrigger>
                                <TabsTrigger value="sales-history">
                                    <History className="mr-2 h-4 w-4" />
                                    Sales History
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="variants" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Product Variants</CardTitle>
                                        <CardDescription>Manage product variants and their stock levels</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ProductVariants id={params.id} />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="price-history" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Price History</CardTitle>
                                        <CardDescription>Track changes in product pricing over time</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ProductPriceHistory id={params.id} />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="sales-history" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Sales History</CardTitle>
                                        <CardDescription>View sales history for this product</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ProductSalesHistory id={params.id} />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    )
}

