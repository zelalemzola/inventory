import type { Metadata } from "next"
import { MainNav } from "@/components/dashboard/main-nav"
import { UserNav } from "@/components/dashboard/user-nav"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EditProductForm } from "@/components/inventory/edit-product-form"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Edit Product | AutoParts",
  description: "Edit product details",
}

export default function EditProductPage({ params }: { params: { id: string } }) {
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
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" asChild>
              <Link href={`/inventory/${params.id}`}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <h2 className="text-3xl font-bold tracking-tight">Edit Product</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
              <CardDescription>Edit the details for this product</CardDescription>
            </CardHeader>
            <CardContent>
              <EditProductForm id={params.id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

