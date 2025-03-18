import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Product from "@/models/Product"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const url = new URL(req.url)
    const searchParams = url.searchParams
    const name = searchParams.get("name")
    const category = searchParams.get("category")
    const status = searchParams.get("status")
    const minStock = searchParams.get("minStock")
    const maxStock = searchParams.get("maxStock")
    const sortBy = searchParams.get("sortBy") || "name"
    const sortOrder = searchParams.get("sortOrder") || "asc"
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const page = Number.parseInt(searchParams.get("page") || "1")

    const skip = (page - 1) * limit

    // Build query
    const query: any = {}

    if (name) {
      query.name = { $regex: name, $options: "i" }
    }

    if (category) {
      query.category = category
    }

    if (status) {
      // Handle comma-separated status values
      if (status.includes(",")) {
        const statusArray = status.split(",").map((s) => s.trim())
        query.status = { $in: statusArray }
      } else {
        query.status = status
      }
    }

    if (minStock) {
      query.stock = { ...query.stock, $gte: Number.parseInt(minStock) }
    }

    if (maxStock) {
      query.stock = { ...query.stock, $lte: Number.parseInt(maxStock) }
    }

    // Build sort object
    const sort: any = {}
    sort[sortBy] = sortOrder === "desc" ? -1 : 1

    const products = await Product.find(query).sort(sort).skip(skip).limit(limit)
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

    const data = await req.json()

    // Check if SKU already exists
    const existingSku = await Product.findOne({ sku: data.sku })
    if (existingSku) {
      return NextResponse.json({ error: "SKU already exists" }, { status: 400 })
    }

    // If product has variants, calculate stock as sum of variant stocks
    if (data.variants && data.variants.length > 0) {
      data.stock = data.variants.reduce((total: number, variant: any) => total + (variant.stock || 0), 0)
    }

    // Set status based on stock level
    if (data.stock <= 0) {
      data.status = "Out of Stock"
    } else if (data.stock <= data.minStockLevel) {
      data.status = "Low Stock"
    } else {
      data.status = "In Stock"
    }

    // Create the product
    const product = await Product.create(data)

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}

