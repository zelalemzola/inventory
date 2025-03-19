import { NextResponse } from "next/server"

import { connectToDatabase } from "@/lib/mongodb"
import Sale from "@/models/sale"

export const GET = async () => {
  try {
    await connectToDatabase()

    const sales = await Sale.find({ status: "Completed" }).sort({ date: -1 }).limit(30).lean()

    const totalSales = await Sale.countDocuments({ status: "Completed" })

    const totalRevenue = await Sale.aggregate([
      { $match: { status: "Completed" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ])

    const totalProfit = await Sale.aggregate([
      { $match: { status: "Completed" } },
      { $group: { _id: null, total: { $sum: "$profit" } } },
    ])

    return NextResponse.json({
      sales,
      totalSales,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalProfit: totalProfit[0]?.total || 0,
    })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

