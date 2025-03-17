import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Product from "@/models/Product"
import StockHistory from "@/models/StockHistory"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const body = await req.json()
    const { quantity, notes } = body

    if (!quantity || quantity <= 0) {
      return NextResponse.json({ error: "Quantity must be greater than 0" }, { status: 400 })
    }

    const product = await Product.findById(params.id)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const previousStock = product.stock
    const newStock = previousStock + quantity

    // Update product stock
    product.stock = newStock
    product.lastRestocked = new Date()
    await product.save()

    // Create stock history record
    await StockHistory.create({
      product: product._id,
      previousStock,
      newStock,
      change: quantity,
      type: "Restock",
      notes: notes || `Restocked ${quantity} units`,
    })

    return NextResponse.json({
      message: "Product restocked successfully",
      product,
    })
  } catch (error) {
    console.error("Error restocking product:", error)
    return NextResponse.json({ error: "Failed to restock product" }, { status: 500 })
  }
}

