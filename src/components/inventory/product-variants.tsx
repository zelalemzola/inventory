"use client"

import { useEffect, useState } from "react"
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { Plus, MoreHorizontal } from "lucide-react"
import axios from "axios"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {toast} from 'sonner'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

type Variant = {
  id: string
  name: string
  sku: string
  price: number
  cost: number
  stock: number
  status: "In Stock" | "Low Stock" | "Out of Stock"
}

type ProductVariantsProps = {
  id: string
}

export function ProductVariants({ id }: ProductVariantsProps) {
  const [variants, setVariants] = useState<Variant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()

  useEffect(() => {
    const fetchProductVariants = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await axios.get(`/api/products/${id}`)

        if (response.data && response.data.variants) {
          // Transform the variants data to include status
          const transformedVariants = response.data.variants.map((variant: any, index: number) => ({
            id: variant._id || `var-${index}`,
            name: variant.name,
            sku: variant.sku,
            price: variant.price,
            cost: variant.cost,
            stock: variant.stock,
            status: variant.stock <= 0 ? "Out of Stock" : variant.stock <= 5 ? "Low Stock" : "In Stock",
          }))

          setVariants(transformedVariants)
        } else {
          setVariants([])
        }
      } catch (error) {
        console.error("Error fetching product variants:", error)
        setError("Failed to load product variants. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchProductVariants()
  }, [id])

  const columns: ColumnDef<Variant>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "sku",
      header: "SKU",
      cell: ({ row }) => <div className="font-mono text-sm">{row.getValue("sku")}</div>,
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => {
        const price = Number.parseFloat(row.getValue("price"))
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(price)
        return <div className="text-right font-medium">{formatted}</div>
      },
    },
    {
      accessorKey: "cost",
      header: "Cost",
      cell: ({ row }) => {
        const cost = Number.parseFloat(row.getValue("cost"))
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(cost)
        return <div className="text-right font-medium">{formatted}</div>
      },
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }) => <div className="text-center">{row.getValue("stock")}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <div className="text-center">
            {status === "In Stock" && (
              <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                In Stock
              </Badge>
            )}
            {status === "Low Stock" && (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                Low Stock
              </Badge>
            )}
            {status === "Out of Stock" && <Badge variant="destructive">Out of Stock</Badge>}
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const variant = row.original

        const handleRestock = async () => {
          try {
            const quantity = prompt("Enter quantity to restock:", "10")
            if (!quantity) return

            // Get the product
            const productResponse = await axios.get(`/api/products/${id}`)
            const product = productResponse.data

            // Find and update the variant
            const updatedVariants = product.variants.map((v: any) => {
              if (v.name === variant.name) {
                return {
                  ...v,
                  stock: v.stock + Number.parseInt(quantity),
                }
              }
              return v
            })

            // Update the product with the new variants
            await axios.put(`/api/products/${id}`, {
              ...product,
              variants: updatedVariants,
            })

            toast({
              title: "Variant restocked",
              description: `Added ${quantity} units to ${variant.name}.`,
            })

            // Refresh the page
            router.refresh()

            // Update the local state
            setVariants(
              variants.map((v) => {
                if (v.id === variant.id) {
                  const newStock = v.stock + Number.parseInt(quantity)
                  return {
                    ...v,
                    stock: newStock,
                    status: newStock <= 0 ? "Out of Stock" : newStock <= 5 ? "Low Stock" : "In Stock",
                  }
                }
                return v
              }),
            )
          } catch (error) {
            toast({
              title: "Error",
              description: "Failed to restock variant. Please try again.",
              variant: "destructive",
            })
          }
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(variant.id)}>
                Copy variant ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleRestock}>Add stock</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Delete variant</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: variants,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (loading) {
    return <div className="flex justify-center p-4">Loading variants...</div>
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Product Variants</h3>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Variant
        </Button>
      </div>

      {variants.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">No variants found for this product.</div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No variants found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

