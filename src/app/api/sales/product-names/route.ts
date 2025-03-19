import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Sale from "@/models/Sale"

export async function GET() {
  try {
    await dbConnect()

    // Get all unique product names from sales
    const productNames = await Sale.aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.productName" } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, name: "$_id" } },
    ])

    // Extract the product names from the result
    const result = await Sale.aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.productName" } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, name: "$_id" } },
    ])

    const names = result.map((item: any) => item.name)

    return NextResponse.json({ names })
  } catch (error) {
    console.error("Error fetching product names:", error)
    return NextResponse.json({ error: "Failed to fetch product names" }, { status: 500 })
  }
}

