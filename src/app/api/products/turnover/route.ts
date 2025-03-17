import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Product from "@/models/Product"
import Sale from "@/models/Sale"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    // Get all products with their categories
    const products = await Product.find().select("_id category stock")

    // Get sales data for each product
    const salesData = await Sale.aggregate([
      { $match: { status: "Completed" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" },
        },
      },
    ])

    // Create a map of product ID to sales quantity
    const salesMap = new Map()
    salesData.forEach((item) => {
      salesMap.set(item._id.toString(), item.totalSold)
    })

    // Calculate turnover for each product
    const productTurnover = products.map((product) => {
      const totalSold = salesMap.get(product.id.toString()) || 0
      const turnover = product.stock > 0 ? totalSold / product.stock : 0

      return {
        _id: product._id,
        category: product.category,
        turnover,
      }
    })

    // Calculate average turnover by category
    const categoryMap = new Map()
    productTurnover.forEach((product) => {
      if (!categoryMap.has(product.category)) {
        categoryMap.set(product.category, { total: 0, count: 0 })
      }

      const categoryData = categoryMap.get(product.category)
      categoryData.total += product.turnover
      categoryData.count += 1
    })

    const turnoverByCategory = Array.from(categoryMap.entries()).map(([category, data]) => ({
      _id: category,
      turnover: data.total / data.count,
    }))

    return NextResponse.json({
      productTurnover,
      turnoverByCategory,
    })
  } catch (error) {
    console.error("Error calculating inventory turnover:", error)
    return NextResponse.json({ error: "Failed to calculate inventory turnover" }, { status: 500 })
  }
}

