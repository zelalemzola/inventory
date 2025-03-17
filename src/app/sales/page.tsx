import type { Metadata } from "next"
import SalesPageClient from "./SalesPageClient"

export const metadata: Metadata = {
    title: "Sales | AutoParts",
    description: "Track and manage your sales transactions",
}

export default function SalesPage() {
    return <SalesPageClient />
}

