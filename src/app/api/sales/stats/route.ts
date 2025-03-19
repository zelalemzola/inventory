import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Sale from "@/models/Sale"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    // Parse query parameters for date filtering
    const url = new URL(req.url)
    const startDate = url.searchParams.get("startDate")
      ? new Date(url.searchParams.get("startDate") as string)
      : new Date(new Date().setMonth(new Date().getMonth() - 1)) // Default to last month

    const endDate = url.searchParams.get("endDate") ? new Date(url.searchParams.get("endDate") as string) : new Date() // Default to current date

    // Ensure end date is set to end of day
    endDate.setHours(23, 59, 59, 999)

    // Create date filter
    const dateFilter = {
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    }

    console.log("Sales stats - Date filter:", dateFilter)

    // Get all sales (both completed and pending)
    const allSales = await Sale.find(dateFilter)

    console.log(`Found ${allSales.length} sales in the given date range`)

    // Calculate totals
    let totalRevenue = 0
    let totalProfit = 0
    let completedSalesCount = 0

    // Process each sale
    for (const sale of allSales) {
      // Include both pending and completed sales in revenue and profit calculations

      // Add sale total to revenue
      totalRevenue += sale.total || 0

      // Calculate profit for this sale
      let saleProfit = 0

      // Check if products exists and is an array
      if (sale.products && Array.isArray(sale.products)) {
        // Process each product in the sale
        for (const item of sale.products) {
          // Calculate profit (price - cost) * quantity
          const itemPrice = item.price || 0
          const itemCost = item.cost || 0
          const itemQuantity = item.quantity || 0

          const itemProfit = (itemPrice - itemCost) * itemQuantity
          console.log(`Item profit calculation: (${itemPrice} - ${itemCost}) * ${itemQuantity} = ${itemProfit}`)

          saleProfit += itemProfit
        }
      } else {
        console.log("Sale has no products array or it's not an array:", sale._id)
      }

      console.log(`Sale ${sale._id} profit: ${saleProfit}`)
      totalProfit += saleProfit

      // Count completed sales separately if needed
      if (sale.status === "completed") {
        completedSalesCount++
      }
    }

    // Log the results for debugging
    console.log("Sales stats results:", {
      totalSales: allSales.length,
      completedSales: completedSalesCount,
      totalRevenue,
      totalProfit,
      dateRange: { startDate, endDate },
    })

    return NextResponse.json({
      totalSales: allSales.length,
      completedSales: completedSalesCount,
      totalRevenue,
      totalProfit,
    })
  } catch (error) {
    console.error("Error fetching sales stats:", error)
    return NextResponse.json({ error: "Failed to fetch sales stats" }, { status: 500 })
  }
}

