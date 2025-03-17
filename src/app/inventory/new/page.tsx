import type { Metadata } from "next"
import { MainNav } from "@/components/dashboard/main-nav"
import { Search } from "@/components/dashboard/search"
import { UserNav } from "@/components/dashboard/user-nav"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Trash } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { NewProductForm } from "@/components/inventory/new-product-form"
import Link from "next/link"

export const metadata: Metadata = {
    title: "Add Product | AutoParts",
    description: "Add a new product to inventory",
}

export default function NewProductPage() {
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
                <div className="flex items-center justify-between space-y-2">
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/inventory">
                                <ArrowLeft className="h-4 w-4" />
                                <span className="sr-only">Back</span>
                            </Link>
                        </Button>
                        <h2 className="text-3xl font-bold tracking-tight">Add New Product</h2>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline">
                            <Trash className="mr-2 h-4 w-4" />
                            Clear
                        </Button>
                        <Button>
                            <Save className="mr-2 h-4 w-4" />
                            Save Product
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Information</CardTitle>
                            <CardDescription>Enter the details for this product</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <NewProductForm />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

