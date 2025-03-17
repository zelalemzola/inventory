"use client"

import * as React from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Plus } from "lucide-react"
import axios from "axios"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {toast} from 'sonner'

type ProductVariant = {
  _id?: string
  name: string
  sku: string
  price: number
  cost: number
  stock: number
}

type Product = {
  _id: string
  name: string
  category: string
  sku: string
  price: number
  cost: number
  stock: number
  status: "In Stock" | "Low Stock" | "Out of Stock"
  variants?: ProductVariant[]
  isVariant?: boolean
  parentProduct?: string
  parentName?: string
}

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const isVariant = row.original.isVariant
      const parentId = row.original.parentProduct
      const linkId = isVariant ? parentId : row.original._id

      return (
        <div>
          <Link href={`/inventory/${linkId}`} className="font-medium hover:underline">
            {row.getValue("name")}
          </Link>
          {isVariant && <div className="text-xs text-muted-foreground">Variant of: {row.original.parentName}</div>}
        </div>
      )
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => <div>{row.getValue("category")}</div>,
  },
  {
    accessorKey: "sku",
    header: "SKU",
    cell: ({ row }) => <div className="font-mono text-sm">{row.getValue("sku")}</div>,
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
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
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Cost
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
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
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Stock
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
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
      const product = row.original
      const router = useRouter()
      

      const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this product?")) return

        try {
          // If it's a variant, we need a different approach
          if (product.isVariant && product.parentProduct) {
            // Get the parent product
            const parentResponse = await axios.get(`/api/products/${product.parentProduct}`)
            const parentProduct = parentResponse.data

            // Filter out the variant
            const updatedVariants = parentProduct.variants.filter((v: ProductVariant) => v.sku !== product.sku)

            // Update the parent product
            await axios.put(`/api/products/${product.parentProduct}`, {
              ...parentProduct,
              variants: updatedVariants,
            })

            toast.success("Variant deleted successfully")
          } else {
            // Regular product deletion
            await axios.delete(`/api/products/${product._id}`)
            toast.success("Product deleted successfully")
          }

          router.refresh()
        } catch (error) {
          toast.error("Failed to delete product. Please try again.")
        }
      }

      const handleRestock = async () => {
        try {
          const quantity = prompt("Enter quantity to restock:", "10")
          if (!quantity) return

          if (product.isVariant && product.parentProduct) {
            // Get the parent product
            const parentResponse = await axios.get(`/api/products/${product.parentProduct}`)
            const parentProduct = parentResponse.data

            // Find and update the variant
            const updatedVariants = parentProduct.variants.map((v: ProductVariant) => {
              if (v.sku === product.sku) {
                return {
                  ...v,
                  stock: v.stock + Number.parseInt(quantity),
                }
              }
              return v
            })

            // Update the parent product
            await axios.put(`/api/products/${product.parentProduct}`, {
              ...parentProduct,
              variants: updatedVariants,
            })
          } else {
            // Regular product restock
            await axios.post(`/api/products/${product._id}/restock`, {
              quantity: Number.parseInt(quantity),
              notes: `Manual restock of ${quantity} units`,
            })
          }

          toast.success(`Added ${quantity} units to inventory.`)
          router.refresh()
        } catch (error) {
          toast.error("Failed to restock product. Please try again.")
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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(product._id)}>
              Copy product ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={`/inventory/${product.isVariant ? product.parentProduct : product._id}`}>View details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href={`/inventory/${product.isVariant ? product.parentProduct : product._id}/edit`}>
                Edit product
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleRestock}>Add stock</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
              Delete {product.isVariant ? "variant" : "product"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export interface InventoryTableProps {
  filters?: Record<string, any>
}

export function InventoryTable({ filters = {} }: InventoryTableProps) {
  const [products, setProducts] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState(true)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const router = useRouter()

  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await axios.get("/api/products", { params: filters })

        // Process products and their variants
        const productsWithVariants: Product[] = []

        response.data.products.forEach((product: Product) => {
          // Add the main product
          productsWithVariants.push(product)

          // Add variants if they exist
          if (product.variants && product.variants.length > 0) {
            product.variants.forEach((variant: ProductVariant) => {
              productsWithVariants.push({
                _id: variant._id || `${product._id}-${variant.sku}`,
                name: variant.name,
                category: product.category,
                sku: variant.sku,
                price: variant.price,
                cost: variant.cost,
                stock: variant.stock,
                status: variant.stock > 0 ? (variant.stock <= 5 ? "Low Stock" : "In Stock") : "Out of Stock",
                isVariant: true,
                parentProduct: product._id,
                parentName: product.name,
              })
            })
          }
        })

        setProducts(productsWithVariants)
      } catch (error) {
        console.error("Error fetching products:", error)
        toast.error("Failed to fetch products. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [filters, toast])

  const table = useReactTable({
    data: products,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter products..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <Button className="ml-4" onClick={() => router.push("/inventory/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
          selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

