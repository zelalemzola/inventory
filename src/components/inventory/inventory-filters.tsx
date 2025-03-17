"use client"

import * as React from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import {toast} from 'sonner'
import { CustomSelect, type SelectOption } from "@/components/ui/custom-select"

export type InventoryFiltersProps = {
    onFilterChange: (filters: Record<string, any>) => void
}

export function InventoryFilters({ onFilterChange }: InventoryFiltersProps) {
    const [value, setValue] = React.useState("")
    const [priceRange, setPriceRange] = React.useState([0, 500])
    const [categories, setCategories] = React.useState<SelectOption[]>([])
    const [stockStatus, setStockStatus] = React.useState({
        inStock: false,
        lowStock: false,
        outOfStock: false,
    })


    React.useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get("/api/products/categories")
                if (response.data) {
                    const formattedCategories = response.data.map((category: string) => ({
                        value: category.toLowerCase(),
                        label: category,
                    }))
                    setCategories(formattedCategories)
                }
            } catch (error) {
                console.error("Error fetching categories:", error)
                toast.error("Failed to load product categories")
            }
        }

        fetchCategories()
    }, [toast])

    const handleApplyFilters = () => {
        const statusFilters = []
        if (stockStatus.inStock) statusFilters.push("In Stock")
        if (stockStatus.lowStock) statusFilters.push("Low Stock")
        if (stockStatus.outOfStock) statusFilters.push("Out of Stock")

        onFilterChange({
            category: value || undefined,
            minPrice: priceRange[0],
            maxPrice: priceRange[1],
            status: statusFilters.length > 0 ? statusFilters.join(",") : undefined,
        })
    }

    const handleResetFilters = () => {
        setValue("")
        setPriceRange([0, 500])
        setStockStatus({
            inStock: false,
            lowStock: false,
            outOfStock: false,
        })
        onFilterChange({})
    }

    return (
        <div className="space-y-4">
            <div className="rounded-lg border p-4">
                <h3 className="mb-4 font-medium leading-none">Filters</h3>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <CustomSelect options={categories} value={value} onChange={setValue} placeholder="Select category..." />
                    </div>

                    <div className="space-y-2">
                        <Label>Price Range</Label>
                        <div className="pt-2">
                            <Slider defaultValue={[0, 500]} max={500} step={10} value={priceRange} onValueChange={setPriceRange} />
                            <div className="flex items-center justify-between pt-2 text-sm">
                                <span>${priceRange[0]}</span>
                                <span>${priceRange[1]}</span>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <Label>Stock Status</Label>
                        <div className="space-y-2 pt-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="in-stock"
                                    checked={stockStatus.inStock}
                                    onCheckedChange={(checked) => setStockStatus((prev) => ({ ...prev, inStock: checked === true }))}
                                />
                                <label
                                    htmlFor="in-stock"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    In Stock
                                </label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="low-stock"
                                    checked={stockStatus.lowStock}
                                    onCheckedChange={(checked) => setStockStatus((prev) => ({ ...prev, lowStock: checked === true }))}
                                />
                                <label
                                    htmlFor="low-stock"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Low Stock
                                </label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="out-of-stock"
                                    checked={stockStatus.outOfStock}
                                    onCheckedChange={(checked) => setStockStatus((prev) => ({ ...prev, outOfStock: checked === true }))}
                                />
                                <label
                                    htmlFor="out-of-stock"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Out of Stock
                                </label>
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

