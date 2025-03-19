"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState, useEffect } from "react"
import { Plus, X } from "lucide-react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

// Standard automotive parts categories
const STANDARD_CATEGORIES = [
  "Air Conditioning",
  "Belts & Hoses",
  "Body & Trim",
  "Brakes",
  "Clutch & Transmission",
  "Cooling System",
  "Electrical",
  "Electronics",
  "Engine",
  "Exhaust",
  "Filters",
  "Fuel System",
  "Heating",
  "Ignition",
  "Interior",
  "Lighting",
  "Oils & Fluids",
  "Sensors",
  "Steering",
  "Suspension",
  "Wheels & Tires",
  "Windshield & Wipers",
  "Other",
]

// Remove stock from main product schema as it will be calculated from variants
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  category: z.string({
    required_error: "Please select a category.",
  }),
  customCategory: z.string().optional(),
  location: z.string().optional(),
  supplier: z.string().optional(),
  minStockLevel: z.coerce.number().min(0, {
    message: "Minimum stock level cannot be negative.",
  }),
  skuPrefix: z.string().optional(),
})

type Variant = {
  id: string
  name: string
  sku: string
  price: number
  cost: number
  stock: number
}

type EditProductFormProps = {
  id: string
}

export function EditProductForm({ id }: EditProductFormProps) {
  const [variants, setVariants] = useState<Variant[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [mainSku, setMainSku] = useState("")
  const [skuFormat, setSkuFormat] = useState<"standard" | "custom">("standard")
  const [useCustomCategory, setUseCustomCategory] = useState(false)
  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/api/products/categories")
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          // Combine fetched categories with standard ones, removing duplicates
          const combinedCategories = [...new Set([...STANDARD_CATEGORIES, ...response.data])]
          setCategories(combinedCategories)
        } else {
          // If API returns empty or invalid data, use standard categories
          setCategories(STANDARD_CATEGORIES)
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
        // Fallback to standard categories on error
        setCategories(STANDARD_CATEGORIES)
      }
    }

    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`/api/products/${id}`)
        const productData = response.data
        setProduct(productData)

        // Set form values
        form.reset({
          name: productData.name,
          description: productData.description || "",
          category: productData.category,
          customCategory: "",
          location: productData.location || "",
          supplier: productData.supplier || "",
          minStockLevel: productData.minStockLevel || 5,
          skuPrefix: "",
        })

        setMainSku(productData.sku)

        // Set variants
        if (productData.variants && productData.variants.length > 0) {
          const formattedVariants = productData.variants.map((variant: any, index: number) => ({
            id: variant._id || `var-${index}`,
            name: variant.name,
            sku: variant.sku,
            price: variant.price,
            cost: variant.cost,
            stock: variant.stock,
          }))
          setVariants(formattedVariants)
        }
      } catch (error) {
        console.error("Error fetching product:", error)
        toast.error("Failed to load product data")
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
    fetchProduct()
  }, [id])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      customCategory: "",
      minStockLevel: 5,
      location: "",
      supplier: "",
      skuPrefix: "",
    },
  })

  // Generate SKU based on product name and category
  const generateSKU = (productName: string, category: string, variantName?: string, customPrefix?: string) => {
    if (!productName || !category) return ""

    // Use custom prefix if provided, otherwise generate from category
    const prefix = customPrefix || category.substring(0, 3).toUpperCase()

    // Get product identifier
    const productId = productName.substring(0, 3).toUpperCase()

    // Generate random part
    const randomNum = Math.floor(1000 + Math.random() * 9000) // 4-digit random number

    if (variantName) {
      // For variants, include variant identifier
      const variantId = variantName.substring(0, 2).toUpperCase()
      return `${prefix}-${productId}-${variantId}-${randomNum}`
    }

    return `${prefix}-${productId}-${randomNum}`
  }

  // Regenerate SKU with a new random number
  const regenerateSKU = () => {
    const productName = form.getValues("name")
    const categoryValue = form.getValues("category")
    const customCategoryValue = form.getValues("customCategory")
    const skuPrefix = form.getValues("skuPrefix")

    // Use custom category if selected, otherwise use regular category
    const category = useCustomCategory ? customCategoryValue : categoryValue

    if (productName && category) {
      const newSku = generateSKU(productName, category, undefined, skuFormat === "custom" ? skuPrefix : undefined)
      setMainSku(newSku)

      // Also regenerate all variant SKUs
      if (variants.length > 0) {
        setVariants(
          variants.map((variant) => ({
            ...variant,
            sku: generateSKU(productName, category, variant.name, skuFormat === "custom" ? skuPrefix : undefined),
          })),
        )
      }
    }
  }

  // Watch for name and category changes to update SKUs
  const productName = form.watch("name")
  const categoryValue = form.watch("category")
  const customCategoryValue = form.watch("customCategory")
  const skuPrefix = form.watch("skuPrefix")

  // Use custom category if selected, otherwise use regular category
  const category = useCustomCategory ? customCategoryValue : categoryValue

  // Calculate total stock from variants
  const calculateTotalStock = () => {
    return variants.reduce((sum, variant) => sum + variant.stock, 0)
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (variants.length === 0) {
        toast.error("Please add at least one variant")
        return
      }

      // Calculate average price and cost from variants for the main product
      const totalPrice = variants.reduce((sum, variant) => sum + variant.price, 0)
      const totalCost = variants.reduce((sum, variant) => sum + variant.cost, 0)
      const totalStock = calculateTotalStock() // Use the calculated total stock
      const avgPrice = totalPrice / variants.length
      const avgCost = totalCost / variants.length

      // Use the appropriate category value
      const finalCategory = useCustomCategory ? values.customCategory : values.category

      // Prepare the product data
      const productData = {
        ...values,
        category: finalCategory, // Use the final category
        sku: mainSku,
        price: avgPrice,
        cost: avgCost,
        stock: totalStock, // Set stock as the sum of variant stocks
        variants: variants.map((variant) => ({
          name: variant.name,
          sku: variant.sku,
          price: variant.price,
          cost: variant.cost,
          stock: variant.stock,
        })),
      }

      // Remove customCategory field as it's not needed in the API
      delete productData.customCategory

      // Update the product
      await axios.put(`/api/products/${id}`, productData)

      toast.success("The product has been updated successfully")

      // Redirect to the product details page
      router.push(`/inventory/${id}`)
    } catch (error: any) {
      console.error("Error updating product:", error)
      toast.error(error.response?.data?.error || "Failed to update product. Please try again.")
    }
  }

  function addVariant() {
    const variantName = `Variant ${variants.length + 1}`
    const newVariant: Variant = {
      id: `var-${Date.now()}`,
      name: variantName,
      sku:
        productName && category
          ? generateSKU(productName, category, variantName, skuFormat === "custom" ? skuPrefix : undefined)
          : "",
      price: 0,
      cost: 0,
      stock: 0,
    }
    setVariants([...variants, newVariant])
  }

  function removeVariant(id: string) {
    setVariants(variants.filter((variant) => variant.id !== id))
  }

  function updateVariant(id: string, field: keyof Variant, value: any) {
    setVariants(
      variants.map((variant) => {
        if (variant.id === id) {
          const updatedVariant = { ...variant, [field]: value }

          // Update SKU if name changes
          if (field === "name" && productName && category) {
            updatedVariant.sku = generateSKU(
              productName,
              category,
              value,
              skuFormat === "custom" ? skuPrefix : undefined,
            )
          }

          return updatedVariant
        }
        return variant
      }),
    )
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading product data...</div>
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter product description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <FormLabel>Category</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setUseCustomCategory(!useCustomCategory)}
                >
                  {useCustomCategory ? "Use Standard Category" : "Add Custom Category"}
                </Button>
              </div>

              {!useCustomCategory ? (
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="customCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Enter custom category" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="minStockLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Stock Level</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Storage Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Aisle 5, Shelf B" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="supplier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter supplier name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* SKU Display Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">SKU Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <FormLabel>Current SKU</FormLabel>
                    <Input value={mainSku} disabled className="bg-muted font-mono" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stock Information Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Stock Information</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>Total Stock: {calculateTotalStock()}</AlertTitle>
                  <AlertDescription>
                    The total stock is calculated as the sum of all variant stocks. Add variants to increase the total
                    stock.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Product Variants</h3>
                <Button type="button" onClick={addVariant} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Variant
                </Button>
              </div>

              {variants.length === 0 ? (
                <div className="rounded-md border border-dashed p-6 text-center">
                  <h4 className="text-sm font-medium">No variants added</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add variants for different versions of this product
                  </p>
                  <Button type="button" onClick={addVariant} variant="outline" className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Variant
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {variants.map((variant) => (
                    <Card key={variant.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Variant</CardTitle>
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeVariant(variant.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <FormLabel>Variant Name</FormLabel>
                            <Input
                              placeholder="e.g., Front Brake Pads"
                              value={variant.name}
                              onChange={(e) => updateVariant(variant.id, "name", e.target.value)}
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <FormLabel>SKU</FormLabel>
                              <Input
                                value={variant.sku}
                                onChange={(e) => updateVariant(variant.id, "sku", e.target.value)}
                                className="font-mono"
                              />
                            </div>
                            <div>
                              <FormLabel>Stock</FormLabel>
                              <Input
                                type="number"
                                min="0"
                                value={variant.stock}
                                onChange={(e) => updateVariant(variant.id, "stock", Number(e.target.value) || 0)}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <FormLabel>Price ($)</FormLabel>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={variant.price || ""}
                                onChange={(e) =>
                                  updateVariant(variant.id, "price", Number.parseFloat(e.target.value) || 0)
                                }
                              />
                            </div>
                            <div>
                              <FormLabel>Cost ($)</FormLabel>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={variant.cost || ""}
                                onChange={(e) =>
                                  updateVariant(variant.id, "cost", Number.parseFloat(e.target.value) || 0)
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.push(`/inventory/${id}`)}>
            Cancel
          </Button>
          <Button type="submit">Update Product</Button>
        </div>
      </form>
    </Form>
  )
}

