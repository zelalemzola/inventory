"use client"

import { useState } from "react"
import { MainNav } from "@/components/dashboard/main-nav"
import { UserNav } from "@/components/dashboard/user-nav"
import { Button } from "@/components/ui/button"
import { Plus, Filter, ArrowUpDown } from "lucide-react"
import { InventoryTable } from "@/components/inventory/inventory-table"
import { InventoryFilters } from "@/components/inventory/inventory-filters"
import { useRouter } from "next/navigation"

export default function InventoryPageClient() {
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [showFilters, setShowFilters] = useState(false)
  const router = useRouter()

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters)
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
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Inventory</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => router.push("/inventory/new")}>
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Add Product</span>
              <span className="sm:hidden">Add</span>
            </Button>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
            <Button variant="outline" className="hidden sm:flex">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Sort
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {showFilters && (
            <div className="md:col-span-1">
              <InventoryFilters onFilterChange={handleFilterChange} />
            </div>
          )}
          <div className={showFilters ? "md:col-span-3" : "md:col-span-4"}>
            <InventoryTable filters={filters} />
          </div>
        </div>
      </div>
    </div>
  )
}

