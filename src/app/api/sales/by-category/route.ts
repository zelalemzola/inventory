import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Sale from "@/models/Sale"
import Product from "@/models/Product"

export async function GET() {
  try {
    await dbConnect()

    console.log("Fetching sales by category data...")

    // Get all products first to have a mapping of product IDs to categories
    const products = await Product.find({}, "category")
    const productCategories: Record<string, string> = {}

    // Create a mapping of product IDs to their categories
    products.forEach((product) => {
      productCategories[product._id.toString()] = product.category || "Uncategorized"
    })

    console.log(`Found ${Object.keys(productCategories).length} products with categories`)

    // Get all sales
    const sales = await Sale.find({})

    console.log(`Found ${sales.length} sales records`)

    // Initialize category data
    const categoryData: Record<string, { revenue: number; count: number }> = {}

    // Process each sale
    for (const sale of sales) {
      // Skip if sale has no products or products is not an array
      if (!sale.products || !Array.isArray(sale.products) || sale.products.length === 0) {
        console.log("Sale has no valid products array:", sale._id)
        continue
      }

      // Process each product in the sale
      for (const item of sale.products) {
        try {
          // Get the product ID
          const productId = item.product
            ? typeof item.product === "object"
              ? item.product.toString()
              : item.product.toString()
            : null

          if (!productId) {
            console.log("Missing product ID for item:", item)
            continue
          }

          // Get the category from our mapping
          const category = productCategories[productId] || "Uncategorized"

          // Initialize category if it doesn't exist
          if (!categoryData[category]) {
            categoryData[category] = { revenue: 0, count: 0 }
          }

          // Add to category revenue and count
          const itemRevenue = (item.price || 0) * (item.quantity || 0)
          categoryData[category].revenue += itemRevenue
          categoryData[category].count += item.quantity || 0

          console.log(`Added ${itemRevenue} revenue and ${item.quantity} count to category ${category}`)
        } catch (err) {
          console.error("Error processing product:", err)
        }
      }
    }

    // Convert to array format for the chart
    const result = Object.entries(categoryData).map(([name, data]) => ({
      name,
      revenue: Math.round(data.revenue * 100) / 100,
      count: data.count,
    }))

    // Sort by revenue (highest first)
    result.sort((a, b) => b.revenue - a.revenue)

    console.log("Sales by category results:", result)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching sales by category:", error)
    return NextResponse.json({ error: "Failed to fetch sales by category" }, { status: 500 })
  }
}

