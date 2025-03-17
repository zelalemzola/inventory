import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import PriceHistory from "@/models/PriceHistory"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const url = new URL(req.url)
    const searchParams = url.searchParams
    const productId = searchParams.get("product")
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const page = Number.parseInt(searchParams.get("page") || "1")

    const skip = (page - 1) * limit

    // Build query
    const query: any = {}

    if (productId) {
      query.product = productId
    }

    const priceHistory = await PriceHistory.find(query).sort({ date: -1 }).skip(skip).limit(limit)

    const total = await PriceHistory.countDocuments(query)

    return NextResponse.json({
      priceHistory,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching price history:", error)
    return NextResponse.json({ error: "Failed to fetch price history" }, { status: 500 })
  }
}

