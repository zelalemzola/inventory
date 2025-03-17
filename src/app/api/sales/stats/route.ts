import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Sale from "@/models/Sale"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const url = new URL(req.url)
    const searchParams = url.searchParams
    const period = searchParams.get("period") || "all"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Build date range query
    const dateQuery: any = {}

    if (startDate && endDate) {
      dateQuery.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    } else if (startDate) {
      dateQuery.date = { $gte: new Date(startDate) }
    } else if (endDate) {
      dateQuery.date = { $lte: new Date(endDate) }
    } else if (period !== "all") {
      const now = new Date()
      const periodStartDate = new Date()

      switch (period) {
        case "today":
          periodStartDate.setHours(0, 0, 0, 0)
          break
        case "yesterday":
          periodStartDate.setDate(periodStartDate.getDate() - 1)
          periodStartDate.setHours(0, 0, 0, 0)
          now.setDate(now.getDate() - 1)
          now.setHours(23, 59, 59, 999)
          break
        case "week":
          periodStartDate.setDate(periodStartDate.getDate() - 7)
          break
        case "month":
          periodStartDate.setMonth(periodStartDate.getMonth() - 1)
          break
        case "year":
          periodStartDate.setFullYear(periodStartDate.getFullYear() - 1)
          break
      }

      dateQuery.date = { $gte: periodStartDate }
      if (period === "yesterday") {
        dateQuery.date.$lte = now
      }
    }

    // Get total sales and profit
    const completedSales = await Sale.find({
      ...dateQuery,
      status: "Completed",
    })

    const totalSales = completedSales.length
    const totalRevenue = completedSales.reduce((sum, sale) => sum + sale.total, 0)
    const totalProfit = completedSales.reduce((sum, sale) => sum + sale.profit, 0)

    // Get sales by category
    const salesByCategory = await Sale.aggregate([
      { $match: { ...dateQuery, status: "Completed" } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $group: {
          _id: "$productInfo.category",
          sales: { $sum: "$items.total" },
        },
      },
      { $sort: { sales: -1 } },
    ])

    // Get top products
    const topProducts = await Sale.aggregate([
      { $match: { ...dateQuery, status: "Completed" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          productName: { $first: "$items.productName" },
          sku: { $first: "$items.sku" },
          quantity: { $sum: "$items.quantity" },
          sales: { $sum: "$items.total" },
        },
      },
      { $sort: { sales: -1 } },
      { $limit: 5 },
    ])

    return NextResponse.json({
      totalSales,
      totalRevenue,
      totalProfit,
      salesByCategory,
      topProducts,
    })
  } catch (error) {
    console.error("Error fetching sales stats:", error)
    return NextResponse.json({ error: "Failed to fetch sales stats" }, { status: 500 })
  }
}

