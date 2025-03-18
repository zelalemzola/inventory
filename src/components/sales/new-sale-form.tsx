"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState, useEffect } from "react"
import { Plus, X, Search, ShoppingCart, Package, AlertCircle, TrendingUp, TrendingDown } from "lucide-react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const formSchema = z.object({
  customer: z.string().min(2, {
    message: "Customer name must be at least 2 characters.",
  }),
  date: z.string(),
  paymentMethod: z.string({
    required_error: "Please select a payment method.",
  }),
  notes: z.string().optional(),
  status: z.enum(["Pending", "Completed"]),
})

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
  sku: string
  price: number
  cost: number
  stock: number
  status: "In Stock" | "Low Stock" | "Out of Stock"
  category: string
  variants: ProductVariant[]
}

type SaleItem = {
  id: string
  product: Product
  variant?: ProductVariant
  quantity: number
  price: number
  cost: number
  total: number
  profit: number
}

export function NewSaleForm() {
  const [items, setItems] = useState<SaleItem[]>([])
  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [quantity, setQuantity] = useState<number>(1)
  const [customPrice, setCustomPrice] = useState<number | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [categories, setCategories] = useState<string[]>([])
  const router = useRouter()

  // Fetch products and categories on component mount
  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/products/categories")
      if (response.data) {
        setCategories(response.data)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Fetching products...")
      // Use a direct API call without params to get all products
      const response = await axios.get("/api/products")

      console.log("Products response:", response.data)

      if (response.data && response.data.products) {
        // Filter out products with no stock here in the client
        const productsWithStock = response.data.products.filter(
          (product: Product) =>
            product.stock > 0 || (product.variants && product.variants.some((variant) => variant.stock > 0)),
        )

        setProducts(productsWithStock)
        setFilteredProducts(productsWithStock)
      } else {
        setError("Invalid response format from server")
      }
    } catch (error: any) {
      console.error("Error fetching products:", error)
      setError(error.response?.data?.error || "Failed to load products. Please try again.")
      toast.error("Failed to load products. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Filter products based on search term and category
  useEffect(() => {
    let filtered = products

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((product) => product.category.toLowerCase() === categoryFilter.toLowerCase())
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) || product.sku.toLowerCase().includes(searchLower),
      )
    }

    setFilteredProducts(filtered)
  }, [searchTerm, categoryFilter, products])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer: "",
      date: new Date().toISOString().split("T")[0],
      paymentMethod: "",
      notes: "",
      status: "Pending",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (items.length === 0) {
      toast.error("Please add at least one item to the sale")
      return
    }

    try {
      // Prepare the sale data
      const saleData = {
        ...values,
        items: items.map((item) => ({
          product: item.product._id,
          variant: item.variant ? item.variant.name : undefined,
          quantity: item.quantity,
          price: item.price,
          cost: item.cost,
        })),
        subtotal: calculateSubtotal(),
        tax: 0, // No tax as requested
        total: calculateSubtotal(), // Total is just the subtotal without tax
        profit: calculateTotalProfit(), // Add total profit
      }

      // Create the sale with the specified status
      await axios.post("/api/sales", {
        ...saleData,
        status: values.status, // Ensure the status from the form is used
      })

      if (values.status === "Pending") {
        toast.success("The sale has been created with Pending status. Inventory will be updated when completed.")
      } else {
        toast.success("The sale has been created and completed successfully")
      }

      // Redirect to the sales page
      router.push("/sales")
    } catch (error: any) {
      console.error("Error creating sale:", error)
      toast.error(error.response?.data?.error || "Failed to create sale. Please try again.")
    }
  }

  function selectProductVariant(product: Product, variant?: ProductVariant) {
    setSelectedProduct(product)
    setSelectedVariant(variant || null)

    // Set default price based on selection
    if (variant) {
      setCustomPrice(variant.price)
    } else {
      setCustomPrice(product.price)
    }

    setProductDialogOpen(false)
  }

  function addItem() {
    if (!selectedProduct) return

    const itemPrice =
      customPrice !== null ? customPrice : selectedVariant ? selectedVariant.price : selectedProduct.price

    const itemCost = selectedVariant ? selectedVariant.cost : selectedProduct.cost

    // Check stock availability
    const stockToCheck = selectedVariant ? selectedVariant.stock : selectedProduct.stock
    if (stockToCheck < quantity) {
      toast.error(`Not enough stock. Available: ${stockToCheck}`)
      return
    }

    const itemTotal = itemPrice * quantity
    const itemProfit = (itemPrice - itemCost) * quantity

    const newItem: SaleItem = {
      id: `item-${Date.now()}`,
      product: selectedProduct,
      variant: selectedVariant || undefined,
      quantity,
      price: itemPrice,
      cost: itemCost,
      total: itemTotal,
      profit: itemProfit,
    }

    setItems([...items, newItem])
    setSelectedProduct(null)
    setSelectedVariant(null)
    setQuantity(1)
    setCustomPrice(null)
  }

  function removeItem(id: string) {
    setItems(items.filter((item) => item.id !== id))
  }

  function calculateSubtotal() {
    return items.reduce((sum, item) => sum + item.total, 0)
  }

  function calculateTotalProfit() {
    return items.reduce((sum, item) => sum + item.profit, 0)
  }

  // Calculate profit margin as a percentage
  function calculateProfitMargin() {
    const subtotal = calculateSubtotal()
    const profit = calculateTotalProfit()
    return subtotal > 0 ? (profit / subtotal) * 100 : 0
  }

  // Update item price and recalculate profit
  function updateItemPrice(id: string, newPrice: number) {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const newTotal = newPrice * item.quantity
          const newProfit = (newPrice - item.cost) * item.quantity
          return {
            ...item,
            price: newPrice,
            total: newTotal,
            profit: newProfit,
          }
        }
        return item
      }),
    )
  }

  // Update item quantity and recalculate total and profit
  function updateItemQuantity(id: string, newQuantity: number) {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          // Check stock availability
          const stockToCheck = item.variant ? item.variant.stock : item.product.stock
          if (stockToCheck < newQuantity) {
            toast.error(`Not enough stock. Available: ${stockToCheck}`)
            return item
          }

          const newTotal = item.price * newQuantity
          const newProfit = (item.price - item.cost) * newQuantity
          return {
            ...item,
            quantity: newQuantity,
            total: newTotal,
            profit: newProfit,
          }
        }
        return item
      }),
    )
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num)
  }

  const totalProfit = calculateTotalProfit()
  const profitMargin = calculateProfitMargin()

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="customer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter customer name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="credit-card">Credit Card</SelectItem>
                      <SelectItem value="debit-card">Debit Card</SelectItem>
                      <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Input placeholder="Add notes (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Sale Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>

                {/* Profit/Loss Display */}
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Profit/Loss</span>
                  <div className="flex items-center">
                    {totalProfit > 0 ? (
                      <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
                    ) : totalProfit < 0 ? (
                      <TrendingDown className="mr-2 h-4 w-4 text-red-500" />
                    ) : null}
                    <span className={totalProfit > 0 ? "text-green-500" : totalProfit < 0 ? "text-red-500" : ""}>
                      ${totalProfit.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Profit Margin Display */}
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Profit Margin</span>
                  <span className={profitMargin > 0 ? "text-green-500" : profitMargin < 0 ? "text-red-500" : ""}>
                    {profitMargin.toFixed(2)}%
                  </span>
                </div>

                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Profit Alert */}
            {items.length > 0 && (
              <Alert
                className={
                  totalProfit > 0 ? "bg-green-50 border-green-200" : totalProfit < 0 ? "bg-red-50 border-red-200" : ""
                }
              >
                {totalProfit > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : totalProfit < 0 ? (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertTitle>
                  {totalProfit > 0 ? "Profitable Sale" : totalProfit < 0 ? "Loss Warning" : "Break-even Sale"}
                </AlertTitle>
                <AlertDescription>
                  {totalProfit > 0
                    ? `This sale will generate $${totalProfit.toFixed(2)} in profit (${profitMargin.toFixed(2)}% margin).`
                    : totalProfit < 0
                      ? `This sale will result in a $${Math.abs(totalProfit).toFixed(2)} loss (${Math.abs(profitMargin).toFixed(2)}% negative margin).`
                      : "This sale will break even with no profit or loss."}
                  {form.getValues("status") === "Pending" &&
                    " Profit/loss will be calculated when the sale is completed."}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Sale Items</h3>
            {error && (
              <div className="text-sm text-red-500">
                Error: {error}
                <Button type="button" variant="outline" size="sm" className="ml-2" onClick={fetchProducts}>
                  Retry
                </Button>
              </div>
            )}
          </div>

          {products.length === 0 && !loading && !error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No products available</AlertTitle>
              <AlertDescription>
                There are no products with stock available. Please add products to inventory first.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <FormLabel>Product</FormLabel>
              <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {selectedProduct
                      ? `${selectedProduct.name}${selectedVariant ? ` (${selectedVariant.name})` : ""}`
                      : "Select product..."}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[625px]">
                  <DialogHeader>
                    <DialogTitle>Select Product</DialogTitle>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Input
                          placeholder="Search products..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Filter by category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {loading ? (
                      <div className="flex items-center justify-center p-8">
                        <p>Loading products...</p>
                      </div>
                    ) : filteredProducts.length === 0 ? (
                      <div className="flex items-center justify-center p-8">
                        <p>No products found</p>
                      </div>
                    ) : (
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-4 pr-3">
                          {filteredProducts.map((product) => (
                            <Card key={product._id} className="overflow-hidden">
                              <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-base flex items-center justify-between">
                                  <span>{product.name}</span>
                                  <Badge
                                    variant={product.status === "In Stock" ? "outline" : "secondary"}
                                    className={
                                      product.status === "In Stock"
                                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                                        : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                    }
                                  >
                                    {product.status} ({formatNumber(product.stock)})
                                  </Badge>
                                </CardTitle>
                                <div className="text-xs text-muted-foreground">
                                  SKU: {product.sku} | Category: {product.category}
                                </div>
                              </CardHeader>
                              <CardContent className="p-4 pt-0">
                                <Tabs defaultValue="main">
                                  <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="main">Main Product</TabsTrigger>
                                    <TabsTrigger
                                      value="variants"
                                      disabled={!product.variants || product.variants.length === 0}
                                    >
                                      Variants ({product.variants?.length || 0})
                                    </TabsTrigger>
                                  </TabsList>
                                  <TabsContent value="main" className="pt-2">
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <p className="font-medium">${product.price.toFixed(2)}</p>
                                        <p className="text-xs text-muted-foreground">
                                          Stock: {formatNumber(product.stock)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          Profit: ${(product.price - product.cost).toFixed(2)} per unit
                                        </p>
                                      </div>
                                      <Button
                                        onClick={() => selectProductVariant(product)}
                                        disabled={product.stock <= 0}
                                      >
                                        <ShoppingCart className="mr-2 h-4 w-4" />
                                        Select
                                      </Button>
                                    </div>
                                  </TabsContent>
                                  <TabsContent value="variants" className="pt-2">
                                    <div className="space-y-2">
                                      {product.variants?.map((variant, index) => (
                                        <div
                                          key={index}
                                          className="flex justify-between items-center border-b pb-2 last:border-0"
                                        >
                                          <div>
                                            <p className="font-medium">{variant.name}</p>
                                            <p className="text-xs text-muted-foreground">SKU: {variant.sku}</p>
                                            <p className="text-xs text-muted-foreground">
                                              Price: ${variant.price.toFixed(2)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                              Profit: ${(variant.price - variant.cost).toFixed(2)} per unit
                                            </p>
                                          </div>
                                          <Button
                                            size="sm"
                                            onClick={() => selectProductVariant(product, variant)}
                                            disabled={variant.stock <= 0}
                                          >
                                            <Package className="mr-2 h-3 w-3" />
                                            Select
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  </TabsContent>
                                </Tabs>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div>
              <FormLabel>Quantity</FormLabel>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => {
                  // Clear any leading zeros
                  const val = e.target.value.replace(/^0+/, "") || "1"
                  setQuantity(Number(val))
                }}
                onFocus={(e) => e.target.select()}
                disabled={!selectedProduct}
              />
            </div>

            <div>
              <FormLabel>Price ($)</FormLabel>
              <Input
                type="number"
                step="0.01"
                value={
                  customPrice !== null
                    ? customPrice
                    : selectedVariant
                      ? selectedVariant.price
                      : selectedProduct
                        ? selectedProduct.price
                        : ""
                }
                onChange={(e) => {
                  // Clear any leading zeros for whole numbers
                  let val = e.target.value
                  if (val.indexOf(".") === -1) {
                    val = val.replace(/^0+/, "") || "0"
                  }
                  setCustomPrice(Number.parseFloat(val) || 0)
                }}
                onFocus={(e) => e.target.select()}
                disabled={!selectedProduct}
                placeholder={
                  selectedVariant
                    ? selectedVariant.price.toString()
                    : selectedProduct
                      ? selectedProduct.price.toString()
                      : ""
                }
              />
            </div>

            <div className="md:col-span-4">
              <Button type="button" onClick={addItem} disabled={!selectedProduct} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left">Product</TableHead>
                  <TableHead className="text-left">Variant</TableHead>
                  <TableHead className="text-left">SKU</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Profit/Loss</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No items added to this sale.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-left">{item.product.name}</TableCell>
                      <TableCell className="text-left">{item.variant?.name || "—"}</TableCell>
                      <TableCell className="text-left font-mono text-sm">
                        {item.variant?.sku || item.product.sku}
                      </TableCell>
                      <TableCell className="text-center">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            // Clear any leading zeros
                            const val = e.target.value.replace(/^0+/, "") || "1"
                            updateItemQuantity(item.id, Number(val) || 1)
                          }}
                          onFocus={(e) => e.target.select()}
                          className="w-16 mx-auto text-center"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => {
                            // Clear any leading zeros for whole numbers
                            let val = e.target.value
                            if (val.indexOf(".") === -1) {
                              val = val.replace(/^0+/, "") || "0"
                            }
                            updateItemPrice(item.id, Number.parseFloat(val) || 0)
                          }}
                          onFocus={(e) => e.target.select()}
                          className="w-24 ml-auto text-right"
                        />
                      </TableCell>
                      <TableCell className="text-right">${item.total.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <span className={item.profit > 0 ? "text-green-500" : item.profit < 0 ? "text-red-500" : ""}>
                          ${item.profit.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.push("/sales")}>
            Cancel
          </Button>
          <Button type="submit" disabled={items.length === 0}>
            Complete Sale
          </Button>
        </div>
      </form>
    </Form>
  )
}

