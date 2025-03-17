import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Product from "@/models/Product"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    // Get counts for different statuses
    const totalProducts = await Product.countDocuments()
    const inStock = await Product.countDocuments({ status: "In Stock" })
    const lowStock = await Product.countDocuments({ status: "Low Stock" })
    const outOfStock = await Product.countDocuments({ status: "Out of Stock" })

    // Get total inventory value
    const products = await Product.find()
    const inventoryValue = products.reduce((total, product) => {
      return total + product.price * product.stock
    }, 0)

    const inventoryCost = products.reduce((total, product) => {
      return total + product.cost * product.stock
    }, 0)

    return NextResponse.json({
      totalProducts,
      inStock,
      lowStock,
      outOfStock,
      inventoryValue,
      inventoryCost,
    })
  } catch (error) {
    console.error("Error fetching product stats:", error)
    return NextResponse.json({ error: "Failed to fetch product stats" }, { status: 500 })
  }
}

