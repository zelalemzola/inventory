import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Sale from "@/models/Sale"
import Product from "@/models/Product"
import { successResponse, errorResponse } from "@/lib/apiResponse"

export async function GET() {
  try {
    await dbConnect()

    // Get all products
    const products = await Product.find()

    // Get all completed sales
    const sales = await Sale.find({ status: "Completed" })

    // Calculate turnover for each product
    const turnoverData = []

    for (const product of products) {
      // Calculate total inventory value
      const inventoryValue = product.totalValue

      // Calculate total sales for this product
      let totalSales = 0

      for (const sale of sales) {
        for (const item of sale.items) {
          if (item.productId && product._id && item.productId.toString() === product._id.toString()) {
            totalSales += item.price * item.quantity
          }
        }
      }

      // Calculate turnover ratio (if inventory value is 0, set to 0 to avoid division by zero)
      const turnoverRatio = inventoryValue > 0 ? totalSales / inventoryValue : 0

      turnoverData.push({
        productId: product._id,
        productName: product.name,
        category: product.category,
        inventoryValue,
        totalSales,
        turnoverRatio,
      })
    }

    // Sort by turnover ratio (highest first)
    turnoverData.sort((a, b) => b.turnoverRatio - a.turnoverRatio)

    return NextResponse.json(successResponse(turnoverData, "Inventory turnover data retrieved successfully"))
  } catch (error: any) {
    console.error("Error fetching inventory turnover:", error)
    return NextResponse.json(errorResponse("Failed to fetch inventory turnover", 500, error), { status: 500 })
  }
}

