import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Sale from "@/models/Sale"

export async function GET() {
  try {
    await dbConnect()

    // Get current date
    const currentDate = new Date()

    // Get date 12 months ago
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(currentDate.getMonth() - 11)
    twelveMonthsAgo.setDate(1) // Start from the first day of the month
    twelveMonthsAgo.setHours(0, 0, 0, 0)

    console.log(`Fetching sales from ${twelveMonthsAgo.toISOString()} to ${currentDate.toISOString()}`)

    // Get all sales in the last 12 months (both completed and pending)
    const sales = await Sale.find({
      createdAt: { $gte: twelveMonthsAgo, $lte: currentDate },
    })

    console.log(`Found ${sales.length} sales in the last 12 months`)

    // Initialize monthly data
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const monthlyData: { month: string; revenue: number; profit: number; count: number }[] = []

    // Generate all 12 months (starting from 11 months ago)
    const startMonth = currentDate.getMonth() - 11
    for (let i = 0; i < 12; i++) {
      let monthIndex = (startMonth + i) % 12
      if (monthIndex < 0) monthIndex += 12

      monthlyData.push({
        month: monthNames[monthIndex],
        revenue: 0,
        profit: 0,
        count: 0,
      })
    }

    // Process sales data
    for (const sale of sales) {
      const saleDate = new Date(sale.createdAt)
      const monthDiff =
        (saleDate.getFullYear() - twelveMonthsAgo.getFullYear()) * 12 + saleDate.getMonth() - twelveMonthsAgo.getMonth()

      if (monthDiff >= 0 && monthDiff < 12) {
        // Add to revenue
        monthlyData[monthDiff].revenue += sale.total || 0
        monthlyData[monthDiff].count += 1

        // Calculate profit
        let saleProfit = 0

        // Check if products exists and is an array
        if (sale.products && Array.isArray(sale.products)) {
          for (const item of sale.products) {
            saleProfit += ((item.price || 0) - (item.cost || 0)) * (item.quantity || 0)
          }
        }

        monthlyData[monthDiff].profit += saleProfit
      }
    }

    // Round numbers
    monthlyData.forEach((data) => {
      data.revenue = Math.round(data.revenue * 100) / 100
      data.profit = Math.round(data.profit * 100) / 100
    })

    console.log("Monthly data:", monthlyData)

    return NextResponse.json(monthlyData)
  } catch (error) {
    console.error("Error fetching monthly sales:", error)
    return NextResponse.json({ error: "Failed to fetch monthly sales" }, { status: 500 })
  }
}

