import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Sale from "@/models/Sale"
import Product from "@/models/Product"

export async function GET() {
  try {
    await dbConnect()

    console.log("Fetching top products data...")

    // Get all products to have their details
    const products = await Product.find({}, "name category")
    const productDetails: Record<string, { name: string; category: string }> = {}

    // Create a mapping of product IDs to their details
    products.forEach((product) => {
      productDetails[product._id.toString()] = {
        name: product.name || "Unknown Product",
        category: product.category || "Uncategorized",
      }
    })

    console.log(`Found ${Object.keys(productDetails).length} products with details`)

    // Get all sales
    const sales = await Sale.find({})

    console.log(`Found ${sales.length} sales records`)

    // Initialize product data
    const productData: Record<
      string,
      {
        revenue: number
        count: number
        profit: number
        name: string
        category: string
      }
    > = {}

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

          // Get product details from our mapping or use defaults
          const details = productDetails[productId] || {
            name: item.name || "Unknown Product",
            category: "Uncategorized",
          }

          // Initialize product data if it doesn't exist
          if (!productData[productId]) {
            productData[productId] = {
              revenue: 0,
              count: 0,
              profit: 0,
              name: details.name,
              category: details.category,
            }
          }

          // Calculate revenue and profit
          const itemPrice = item.price || 0
          const itemCost = item.cost || 0
          const itemQuantity = item.quantity || 0

          const itemRevenue = itemPrice * itemQuantity
          const itemProfit = (itemPrice - itemCost) * itemQuantity

          // Add to product revenue, count, and profit
          productData[productId].revenue += itemRevenue
          productData[productId].count += itemQuantity
          productData[productId].profit += itemProfit

          console.log(
            `Added ${itemRevenue} revenue, ${itemProfit} profit, and ${itemQuantity} count to product ${details.name}`,
          )
        } catch (err) {
          console.error("Error processing product:", err)
        }
      }
    }

    // Convert to array format for the chart
    const result = Object.values(productData)
      // Filter out products with zero revenue
      .filter((data) => data.revenue > 0)
      .map((data) => ({
        name: data.name,
        revenue: Math.round(data.revenue * 100) / 100,
        count: data.count,
        profit: Math.round(data.profit * 100) / 100,
        category: data.category,
      }))

    // Sort by revenue (highest first)
    result.sort((a, b) => b.revenue - a.revenue)

    // Limit to top 10 products
    const topProducts = result.slice(0, 10)

    console.log("Top products results:", topProducts)

    return NextResponse.json(topProducts)
  } catch (error) {
    console.error("Error fetching top products:", error)
    return NextResponse.json({ error: "Failed to fetch top products" }, { status: 500 })
  }
}

