import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Product from "@/models/Product"
import PriceHistory from "@/models/PriceHistory"
import StockHistory from "@/models/StockHistory"
import Notification from "@/models/Notification"

export async function GET(req, { params }) {
  try {
    await dbConnect()

    const product = await Product.findById(params.id)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(req, { params }) {
  try {
    await dbConnect()

    const body = await req.json()
    const product = await Product.findById(params.id)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Check if price has changed
    if (body.price && body.price !== product.price) {
      await PriceHistory.create({
        product: product._id,
        oldPrice: product.price,
        newPrice: body.price,
        date: new Date(),
        reason: body.priceChangeReason || "Price update",
      })

      await Notification.create({
        title: "Price Change",
        message: `Price for ${product.name} changed from $${product.price.toFixed(2)} to $${body.price.toFixed(2)}`,
        type: "Price Change",
        product: product._id,
      })
    }

    // Check if stock has changed
    if (body.stock !== undefined && body.stock !== product.stock) {
      await StockHistory.create({
        product: product._id,
        previousStock: product.stock,
        newStock: body.stock,
        change: body.stock - product.stock,
        type: "Adjustment",
        notes: body.stockChangeReason || "Stock adjustment",
      })

      // Create notification if new stock level is low or out
      const newStockLevel = body.stock
      const minStockLevel = body.minStockLevel || product.minStockLevel

      if (newStockLevel <= 0) {
        await Notification.create({
          title: "Out of Stock Alert",
          message: `${product.name} is now out of stock`,
          type: "Out of Stock",
          product: product._id,
        })
      } else if (newStockLevel <= minStockLevel) {
        await Notification.create({
          title: "Low Stock Alert",
          message: `${product.name} is low in stock (${newStockLevel} remaining)`,
          type: "Low Stock",
          product: product._id,
        })
      }
    }

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: true },
    )

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect()

    // Check if the ID is valid
    if (!params.id || params.id.length !== 24) {
      return NextResponse.json({ error: "Invalid product ID format" }, { status: 400 })
    }

    // Try to find and delete the product
    const product = await Product.findByIdAndDelete(params.id)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}

