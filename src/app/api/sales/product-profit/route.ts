import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Sale from "@/models/Sale"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    // Aggregate sales data to get profit by product
    const productProfit = await Sale.aggregate([
      { $match: { status: "Completed" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productName",
          profit: { $sum: { $multiply: [{ $subtract: ["$items.price", "$items.cost"] }, "$items.quantity"] } },
          sales: { $sum: "$items.quantity" },
        },
      },
      {
        $project: {
          name: "$_id",
          profit: 1,
          sales: 1,
          _id: 0,
        },
      },
      { $sort: { profit: -1 } },
      { $limit: 10 },
    ])

    // Aggregate sales data to get profit by variant
    const variantProfit = await Sale.aggregate([
      { $match: { status: "Completed" } },
      { $unwind: "$items" },
      { $match: { "items.variant": { $exists: true, $ne: null } } },
      {
        $group: {
          _id: {
            product: "$items.productName",
            variant: "$items.variant",
          },
          profit: { $sum: { $multiply: [{ $subtract: ["$items.price", "$items.cost"] }, "$items.quantity"] } },
          sales: { $sum: "$items.quantity" },
        },
      },
      {
        $project: {
          name: { $concat: ["$_id.product", " (", "$_id.variant", ")"] },
          product: "$_id.product",
          variant: "$_id.variant",
          profit: 1,
          sales: 1,
          _id: 0,
        },
      },
      { $sort: { profit: -1 } },
      { $limit: 10 },
    ])

    return NextResponse.json({
      productProfit,
      variantProfit,
    })
  } catch (error) {
    console.error("Error fetching product profit:", error)
    return NextResponse.json({ error: "Failed to fetch product profit" }, { status: 500 })
  }
}

