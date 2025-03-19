import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Product from "@/models/Product"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    // Get all products
    const products = await Product.find({})

    // Log the number of products found
    console.log(`Found ${products.length} products in the database`)

    // Calculate inventory value
    let inventoryValue = 0
    let totalProducts = 0
    let lowStock = 0
    let outOfStock = 0

    // Process each product
    for (const product of products) {
      totalProducts++

      // Calculate main product value
      const productValue = product.stock * product.cost
      inventoryValue += productValue

      // Log individual product values for debugging
      console.log(`Product: ${product.name}, Stock: ${product.stock}, Cost: ${product.cost}, Value: ${productValue}`)

      // Check stock status
      if (product.stock <= 0) {
        outOfStock++
      } else if (product.stock <= product.minStockLevel) {
        lowStock++
      }

      // Process variants if they exist
      if (product.variants && product.variants.length > 0) {
        for (const variant of product.variants) {
          // Add variant value to inventory value
          const variantValue = variant.stock * variant.cost
          inventoryValue += variantValue

          // Log variant values
          console.log(
            `  Variant: ${variant.name}, Stock: ${variant.stock}, Cost: ${variant.cost}, Value: ${variantValue}`,
          )

          // Check variant stock status
          if (variant.stock <= 0) {
            outOfStock++
          } else if (variant.stock <= (variant.minStockLevel || product.minStockLevel)) {
            lowStock++
          }
        }
      }
    }

    // Log the final calculated values
    console.log("Product stats:", {
      totalProducts,
      inventoryValue,
      lowStock,
      outOfStock,
    })

    // For this example, we'll just calculate a random change
    // In a real app, you would query historical data
    const lowStockChange = Math.floor(Math.random() * 5) - 2 // Random number between -2 and 2

    return NextResponse.json({
      totalProducts,
      inventoryValue,
      lowStock,
      outOfStock,
      lowStockChange,
    })
  } catch (error) {
    console.error("Error fetching product stats:", error)
    return NextResponse.json({ error: "Failed to fetch product stats" }, { status: 500 })
  }
}

