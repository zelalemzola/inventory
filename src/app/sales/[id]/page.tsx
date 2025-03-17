import type { Metadata } from "next"
import { MainNav } from "@/components/dashboard/main-nav"
import { UserNav } from "@/components/dashboard/user-nav"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Printer, Download } from "lucide-react"

import Link from "next/link"
import { SaleDetails } from "@/components/sales/sale-details"

export const metadata: Metadata = {
    title: "Sale Details | AutoParts",
    description: "View sale transaction details",
}

export default function SaleDetailsPage({ params }: { params: { id: string } }) {
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
                            <Link href="/sales">
                                <ArrowLeft className="h-4 w-4" />
                                <span className="sr-only">Back</span>
                            </Link>
                        </Button>
                        <h2 className="text-3xl font-bold tracking-tight">Sale Details</h2>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline">
                            <Printer className="mr-2 h-4 w-4" />
                            Print Invoice
                        </Button>
                        <Button variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <SaleDetails id={params.id} />
                </div>
            </div>
        </div>
    )
}

