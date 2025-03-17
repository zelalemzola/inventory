"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { CustomSelect, type SelectOption } from "@/components/ui/custom-select"

const statuses: SelectOption[] = [
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
  { value: "cancelled", label: "Cancelled" },
]

export type SalesFiltersProps = {
  onFilterChange: (filters: Record<string, any>) => void
}

export function SalesFilters({ onFilterChange }: SalesFiltersProps) {
  const [value, setValue] = React.useState("")
  const [totalRange, setTotalRange] = React.useState([0, 500])
  const [startDate, setStartDate] = React.useState("")
  const [endDate, setEndDate] = React.useState("")

  const handleApplyFilters = () => {
    onFilterChange({
      status: value || undefined,
      minTotal: totalRange[0],
      maxTotal: totalRange[1],
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    })
  }

  const handleResetFilters = () => {
    setValue("")
    setTotalRange([0, 500])
    setStartDate("")
    setEndDate("")
    onFilterChange({})
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4">
        <h3 className="mb-4 font-medium leading-none">Filters</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <CustomSelect options={statuses} value={value} onChange={setValue} placeholder="Select status..." />
          </div>

          <div className="space-y-2">
            <Label>Total Amount Range</Label>
            <div className="pt-2">
              <Slider defaultValue={[0, 500]} max={500} step={10} value={totalRange} onValueChange={setTotalRange} />
              <div className="flex items-center justify-between pt-2 text-sm">
                <span>${totalRange[0]}</span>
                <span>${totalRange[1]}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Date Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="from-date" className="text-xs">
                  From
                </Label>
                <Input id="from-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="to-date" className="text-xs">
                  To
                </Label>
                <Input id="to-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
          </div>

          <Separator />

          <Button className="w-full" onClick={handleApplyFilters}>
            Apply Filters
          </Button>
          <Button variant="outline" className="w-full" onClick={handleResetFilters}>
            Reset
          </Button>
        </div>
      </div>
    </div>
  )
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      {...props}
    />
  )
}

