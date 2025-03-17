"use client"

import { useState } from "react"
import { MainNav } from "@/components/dashboard/main-nav"
import { UserNav } from "@/components/dashboard/user-nav"
import { Button } from "@/components/ui/button"
import { Plus, Download, Filter } from "lucide-react"
import { SalesTable } from "@/components/sales/sales-table"
import { SalesFilters } from "@/components/sales/sales-filters"
import { DateRangePicker } from "@/components/date-range-picker"
import { useRouter } from "next/navigation"

export default function SalesPageClient() {
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
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Sales</h2>
          <div className="flex flex-wrap gap-2">
            <div className="hidden md:block">
              <DateRangePicker />
            </div>
            <Button onClick={() => router.push("/sales/new")}>
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">New Sale</span>
              <span className="sm:hidden">New</span>
            </Button>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
            <Button variant="outline" className="hidden sm:flex">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {showFilters && (
            <div className="md:col-span-1">
              <SalesFilters onFilterChange={handleFilterChange} />
            </div>
          )}
          <div className={showFilters ? "md:col-span-3" : "md:col-span-4"}>
            <SalesTable filters={filters} />
          </div>
        </div>
      </div>
    </div>
  )
}

