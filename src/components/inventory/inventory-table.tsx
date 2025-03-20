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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type ProductVariant = {
  _id?: string
  name: string
  sku: string
  price: number
  cost: number
  stock: number
  minStockLevel?: number
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

export function InventoryTable({ filters = {} }: { filters?: Record<string, any> }) {
  const [products, setProducts] = React.useState<Product[]>([])
  const [allCategories, setAllCategories] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState(true)
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "updatedAt", desc: true }]) // Default sort by most recent
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all")
  
  const router = useRouter()

  // Fetch all categories
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/api/products/categories")
        if (response.data) {
          setAllCategories(response.data)
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }

    fetchCategories()
  }, [])

  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)

        // Prepare filters
        const params: Record<string, any> = { ...filters }

        // Add status filter if not "all"
        if (statusFilter !== "all") {
          params.status = statusFilter
        }

        // Add category filter if not "all"
        if (categoryFilter !== "all") {
          params.category = categoryFilter
        }

        // Add sorting based on current sort state
        if (sorting.length > 0) {
          params.sortBy = sorting[0].id
          params.sortOrder = sorting[0].desc ? "desc" : "asc"
        } else {
          // Default sort by updatedAt desc (most recent first)
          params.sortBy = "updatedAt"
          params.sortOrder = "desc"
        }

        const response = await axios.get("/api/products", { params })

        // Process products and their variants
        const productsWithVariants: Product[] = []

        response.data.products.forEach((product: Product) => {
          // Add the main product
          productsWithVariants.push(product)

          // Add variants if they exist
          if (product.variants && product.variants.length > 0) {
            product.variants.forEach((variant: ProductVariant) => {
              // Determine variant status
              let variantStatus: "In Stock" | "Low Stock" | "Out of Stock" = "In Stock"
              if (variant.stock <= 0) {
                variantStatus = "Out of Stock"
              } else if (variant.stock <= (variant.minStockLevel || 5)) {
                variantStatus = "Low Stock"
              }

              // Only add variant if it matches status filter
              if (statusFilter === "all" || statusFilter === variantStatus) {
                productsWithVariants.push({
                  _id: variant._id || `${product._id}-${variant.sku}`,
                  name: variant.name,
                  category: product.category,
                  sku: variant.sku,
                  price: variant.price,
                  cost: variant.cost,
                  stock: variant.stock,
                  status: variantStatus,
                  isVariant: true,
                  parentProduct: product._id,
                  parentName: product.name,
                })
              }
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
  }, [filters, statusFilter, categoryFilter, sorting, toast])

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const isVariant = row.original.isVariant
        const parentId = row.original.parentProduct
        const linkId = isVariant ? parentId : row.original._id

        return (
          <div className="text-left">
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
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Category
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="text-left">{row.getValue("category")}</div>,
    },
    {
      accessorKey: "sku",
      header: "SKU",
      cell: ({ row }) => <div className="text-left font-mono text-sm">{row.getValue("sku")}</div>,
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
      cell: ({ row }) => {
        const stock = Number.parseFloat(row.getValue("stock"))
        const formatted = new Intl.NumberFormat("en-US").format(stock)
        return <div className="text-center">{formatted}</div>
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
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
              <DropdownMenuItem asChild>
                <Link href={`/inventory/${product.isVariant ? product.parentProduct : product._id}`}>View details</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
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

  // Add a dropdown menu for sorting options
  const sortOptions = [
    { label: "Name (A-Z)", field: "name", order: "asc" },
    { label: "Name (Z-A)", field: "name", order: "desc" },
    { label: "Price (Low to High)", field: "price", order: "asc" },
    { label: "Price (High to Low)", field: "price", order: "desc" },
    { label: "Stock (Low to High)", field: "stock", order: "asc" },
    { label: "Stock (High to Low)", field: "stock", order: "desc" },
    { label: "Most Recent", field: "updatedAt", order: "desc" },
    { label: "Oldest", field: "updatedAt", order: "asc" },
  ]

  const handleSort = (field: string, order: "asc" | "desc") => {
    setSorting([{ id: field, desc: order === "desc" }])
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num)
  }

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row items-center gap-4 py-4">
        <Input
          placeholder="Filter products..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />

        <div className="flex-1 min-w-[200px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="In Stock">In Stock</SelectItem>
              <SelectItem value="Low Stock">Low Stock</SelectItem>
              <SelectItem value="Out of Stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {allCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={`${option.field}-${option.order}`}
                onClick={() => handleSort(option.field, option.order as "asc" | "desc")}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button className="ml-auto" onClick={() => router.push("/inventory/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
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
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={
                        header.id === "price" || header.id === "cost"
                          ? "text-right"
                          : header.id === "stock" || header.id === "status"
                            ? "text-center"
                            : "text-left"
                      }
                    >
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
                    <TableCell
                      key={cell.id}
                      className={
                        cell.column.id === "price" || cell.column.id === "cost"
                          ? "text-right"
                          : cell.column.id === "stock" || cell.column.id === "status"
                            ? "text-center"
                            : "text-left"
                      }
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
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
          {formatNumber(table.getFilteredSelectedRowModel().rows.length)} of{" "}
          {formatNumber(table.getFilteredRowModel().rows.length)} row(s) selected.
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

