import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Sale from "@/models/Sale"

export async function GET() {
  try {
    await dbConnect()

    // Aggregate sales data to get unique product names
    const productNames = await Sale.aggregate([
      { $match: { status: "Completed" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productName",
        },
      },
      { $sort: { _id: 1 } },
    ])

    // Extract just the names
    const names = productNames.map((item) => item._id).filter(Boolean)

    return NextResponse.json({
      names,
    })
  } catch (error) {
    console.error("Error fetching product names:", error)
    return NextResponse.json({ error: "Failed to fetch product names" }, { status: 500 })
  }
}

