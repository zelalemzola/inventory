import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Sale from "@/models/Sale"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const interval = searchParams.get("interval") || "month" // week, month, quarter, year

    // Build date filter
    const dateFilter: any = {}

    if (startDate) {
      dateFilter.date = { ...dateFilter.date, $gte: new Date(startDate) }
    }

    if (endDate) {
      dateFilter.date = { ...dateFilter.date, $lte: new Date(endDate) }
    }

    // Get completed sales within date range
    const sales = await Sale.find({
      ...dateFilter,
      status: "Completed",
    }).sort({ date: 1 })

    // Process sales data based on interval
    const profitByDate = new Map()

    sales.forEach((sale) => {
      let dateKey
      const date = new Date(sale.date)

      if (interval === "week") {
        // For weekly, use day of week
        dateKey = date.toLocaleDateString()
      } else if (interval === "month") {
        // For monthly, use day of month
        dateKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`
      } else if (interval === "quarter") {
        // For quarterly, use week of quarter
        const weekNumber = Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7)
        dateKey = `Week ${weekNumber}, ${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`
      } else {
        // For yearly, use month
        dateKey = date.toLocaleString("default", { month: "short" }) + " " + date.getFullYear()
      }

      if (!profitByDate.has(dateKey)) {
        profitByDate.set(dateKey, { revenue: 0, profit: 0 })
      }

      const data = profitByDate.get(dateKey)
      data.revenue += sale.total || 0
      data.profit += sale.profit || 0
    })

    // Convert to array and sort by date
    const profitData = Array.from(profitByDate.entries())
      .map(([name, values]) => ({
        name,
        revenue: values.revenue,
        profit: values.profit,
      }))
      .sort((a, b) => {
        // Sort based on interval
        if (interval === "week" || interval === "month") {
          return new Date(a.name).getTime() - new Date(b.name).getTime()
        }
        return a.name.localeCompare(b.name)
      })

    return NextResponse.json({
      profitData,
    })
  } catch (error) {
    console.error("Error fetching profit tracking data:", error)
    return NextResponse.json({ error: "Failed to fetch profit tracking data" }, { status: 500 })
  }
}

