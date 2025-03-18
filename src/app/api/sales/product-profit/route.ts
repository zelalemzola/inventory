import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Sale from "@/models/Sale"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const period = searchParams.get("period") || "all"
    const product = searchParams.get("product")

    // Calculate date range based on period
    let dateFilter = {}
    const now = new Date()

    if (period === "today") {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0))
      dateFilter = { date: { $gte: startOfDay } }
    } else if (period === "week") {
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay()) // Start of week (Sunday)
      startOfWeek.setHours(0, 0, 0, 0)
      dateFilter = { date: { $gte: startOfWeek } }
    } else if (period === "month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      dateFilter = { date: { $gte: startOfMonth } }
    } else if (period === "year") {
      const startOfYear = new Date(now.getFullYear(), 0, 1)
      dateFilter = { date: { $gte: startOfYear } }
    }

    // Build match query
    const matchQuery: any = {
      status: "Completed",
      ...dateFilter,
    }

    // Aggregate sales data to get profit by product
    const productProfit = await Sale.aggregate([
      { $match: matchQuery },
      { $unwind: "$items" },
      ...(product ? [{ $match: { "items.productName": product } }] : []),
      {
        $group: {
          _id: "$items.productName",
          profit: { $sum: { $multiply: [{ $subtract: ["$items.price", "$items.cost"] }, "$items.quantity"] } },
          sales: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      {
        $project: {
          name: "$_id",
          profit: 1,
          sales: 1,
          revenue: 1,
          _id: 0,
        },
      },
      { $sort: { profit: -1 } },
      { $limit: 10 },
    ])

    // Aggregate sales data to get profit by variant
    const variantProfit = await Sale.aggregate([
      { $match: matchQuery },
      { $unwind: "$items" },
      { $match: { "items.variant": { $exists: true, $ne: null } } },
      ...(product ? [{ $match: { "items.productName": product } }] : []),
      {
        $group: {
          _id: {
            product: "$items.productName",
            variant: "$items.variant",
          },
          profit: { $sum: { $multiply: [{ $subtract: ["$items.price", "$items.cost"] }, "$items.quantity"] } },
          sales: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      {
        $project: {
          name: { $concat: ["$_id.product", " (", "$_id.variant", ")"] },
          product: "$_id.product",
          variant: "$_id.variant",
          profit: 1,
          sales: 1,
          revenue: 1,
          _id: 0,
        },
      },
      { $sort: { profit: -1 } },
      { $limit: 20 },
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

