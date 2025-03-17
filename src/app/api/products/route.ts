import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Product from "@/models/Product"
import StockHistory from "@/models/StockHistory"
import Notification from "@/models/Notification"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const url = new URL(req.url)
    const searchParams = url.searchParams
    const category = searchParams.get("category")
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const page = Number.parseInt(searchParams.get("page") || "1")

    const skip = (page - 1) * limit

    // Build query
    const query: any = {}

    if (category) {
      query.category = category
    }

    if (status) {
      query.status = status
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ]
    }

    const products = await Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)

    const total = await Product.countDocuments(query)

    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const body = await req.json()

    // Create new product
    const product = new Product(body)
    await product.save()

    // Create stock history record
    await StockHistory.create({
      product: product._id,
      previousStock: 0,
      newStock: product.stock,
      change: product.stock,
      type: "Initial",
      notes: "Initial stock on product creation",
    })

    // Create notification if stock is low or out
    if (product.status === "Low Stock") {
      await Notification.create({
        title: "Low Stock Alert",
        message: `${product.name} is low in stock (${product.stock} remaining)`,
        type: "Low Stock",
        product: product._id,
      })
    } else if (product.status === "Out of Stock") {
      await Notification.create({
        title: "Out of Stock Alert",
        message: `${product.name} is out of stock`,
        type: "Out of Stock",
        product: product._id,
      })
    }

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}

