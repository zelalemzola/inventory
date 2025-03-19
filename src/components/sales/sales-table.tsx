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
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"
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
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Sale = {
  _id: string
  date: string
  customer: string
  items: any[]
  subtotal: number
  tax: number
  total: number
  profit: number
  status: "Completed" | "Pending" | "Cancelled"
}

export const columns: ColumnDef<Sale>[] = [
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="text-left">{new Date(row.getValue("date")).toLocaleDateString()}</div>,
  },
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ row }) => <div className="text-left">{row.getValue("customer")}</div>,
  },
  {
    accessorKey: "items",
    header: "Products",
    cell: ({ row }) => {
      const items = row.getValue("items") as any[]
      if (items.length === 0) return <div>No items</div>

      // Display the first item and a count if there are more
      const firstItem = items[0]
      const productName = firstItem.productName || "Unknown Product"
      const variantInfo = firstItem.variant ? ` (${firstItem.variant})` : ""

      return (
        <div className="text-left">
          <div className="font-medium">
            {productName}
            {variantInfo}
          </div>
          {items.length > 1 && <div className="text-xs text-muted-foreground">+{items.length - 1} more items</div>}
        </div>
      )
    },
  },
  {
    accessorKey: "total",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Total
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const total = Number.parseFloat(row.getValue("total"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(total)
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "profit",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Profit
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const profit = Number.parseFloat(row.getValue("profit"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(profit)
      return (
        <div className={`text-right font-medium ${profit > 0 ? "text-green-600" : profit < 0 ? "text-red-600" : ""}`}>
          {formatted}
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <div className="text-center">
          {status === "Completed" && (
            <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
              Completed
            </Badge>
          )}
          {status === "Pending" && (
            <div>
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                Pending
              </Badge>
              <div className="text-xs text-muted-foreground mt-1">Inventory not yet updated</div>
            </div>
          )}
          {status === "Cancelled" && <Badge variant="destructive">Cancelled</Badge>}
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const sale = row.original
      const router = useRouter()
      const { toast } = useToast()

      const handleCancelSale = async () => {
        if (!confirm("Are you sure you want to cancel this sale?")) return

        try {
          await axios.put(`/api/sales/${sale._id}`, {
            status: "Cancelled",
          })

          toast.success("The sale has been cancelled successfully.")
          router.refresh()
        } catch (error) {
          toast.error("Failed to cancel sale. Please try again.")
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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(sale._id)}>Copy invoice ID</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={`/sales/${sale._id}`}>View details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.print()}>Print invoice</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleCancelSale}
              disabled={sale.status === "Cancelled"}
              className="text-destructive"
            >
              Cancel sale
            </DropdownMenuItem>
            {sale.status === "Pending" && (
              <DropdownMenuItem
                onClick={async () => {
                  if (!confirm("Are you sure you want to complete this sale? This will update inventory.")) return

                  try {
                    await axios.put(`/api/sales/${sale._id}`, {
                      status: "Completed",
                    })

                    toast.success("The sale has been marked as completed and inventory has been updated.")
                    router.refresh()
                  } catch (error) {
                    toast.error("Failed to complete sale. Please try again.")
                  }
                }}
              >
                Mark as Completed
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export interface SalesTableProps {
  filters?: Record<string, any>
}

export function SalesTable({ filters = {} }: SalesTableProps) {
  const [sales, setSales] = React.useState<Sale[]>([])
  const [loading, setLoading] = React.useState(true)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const { toast } = useToast()
  const router = useRouter()

  React.useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true)
        const params = { ...filters }

        // Add status filter if not "all"
        if (statusFilter !== "all") {
          params.status = statusFilter
        }

        const response = await axios.get("/api/sales", { params })
        setSales(response.data.sales)
      } catch (error) {
        console.error("Error fetching sales:", error)
        toast.error("Failed to fetch sales. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchSales()
  }, [filters, statusFilter, toast, router])

  const table = useReactTable({
    data: sales,
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
      <div className="flex flex-col md:flex-row items-center gap-4 py-4">
        <Input
          placeholder="Filter by customer..."
          value={(table.getColumn("customer")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("customer")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />

        <div className="flex-1 min-w-[200px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-left">
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
                <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.id === "total" || cell.column.id === "profit" ? "text-right" : ""}
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

