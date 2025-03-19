import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Product from "@/models/Product"
import { isValidObjectId } from "mongoose"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const id = params.id
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
    }

    const product = await Product.findById(id)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const id = params.id
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
    }

    const data = await req.json()

    // If product has variants, calculate stock as sum of variant stocks
    if (data.variants && data.variants.length > 0) {
      data.stock = data.variants.reduce((total: number, variant: any) => total + (variant.stock || 0), 0)
    }

    // Update status based on stock level
    if (data.stock <= 0) {
      data.status = "Out of Stock"
    } else if (data.stock <= data.minStockLevel) {
      data.status = "Low Stock"
    } else {
      data.status = "In Stock"
    }

    const product = await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const id = params.id
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
    }

    const product = await Product.findByIdAndDelete(id)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}

