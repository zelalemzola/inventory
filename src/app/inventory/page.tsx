import type { Metadata } from "next"
import InventoryPageClient from "./inventory-page-client"

export const metadata: Metadata = {
  title: "Inventory | AutoParts",
  description: "Manage your auto parts inventory",
}

export default function InventoryPage() {
  return <InventoryPageClient />
}

