import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Product from "@/models/Product"

export async function GET() {
  try {
    await dbConnect()

    // Get all unique categories
    const categories = await Product.distinct("category")

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

