// import { type NextRequest, NextResponse } from "next/server"
// import dbConnect from "@/lib/db"
// import Sale from "@/models/Sale"
// import Product from "@/models/Product"

// export async function GET(req: NextRequest) {
//   try {
//     await dbConnect()

//     // Get query parameters
//     const { searchParams } = new URL(req.url)
//     const period = searchParams.get("period") || "all"

//     // Calculate date range based on period
//     let dateFilter = {}
//     const now = new Date()

//     if (period === "today") {
//       const startOfDay = new Date(now.setHours(0, 0, 0, 0))
//       dateFilter = { date: { $gte: startOfDay } }
//     } else if (period === "week") {
//       const startOfWeek = new Date(now)
//       startOfWeek.setDate(now.getDate() - now.getDay()) // Start of week (Sunday)
//       startOfWeek.setHours(0, 0, 0, 0)
//       dateFilter = { date: { $gte: startOfWeek } }
//     } else if (period === "month") {
//       const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
//       dateFilter = { date: { $gte: startOfMonth } }
//     } else if (period === "year") {
//       const startOfYear = new Date(now.getFullYear(), 0, 1)
//       dateFilter = { date: { $gte: startOfYear } }
//     }

//     // Get all completed sales
//     const completedSales = await Sale.find({
//       status: "Completed",
//       ...dateFilter,
//     }).lean()

//     // Get all product categories
//     const categories = await Product.distinct("category")

//     // Initialize category profit data
//     const categoryProfitMap = new Map()
//     categories.forEach((category) => {
//       categoryProfitMap.set(category, {
//         revenue: 0,
//         cost: 0,
//         profit: 0,
//         sales: 0,
//       })
//     })

//     // Calculate profit by category
//     for (const sale of completedSales) {
//       for (const item of sale.items) {
//         // Get the product to determine its category
//         const product = await Product.findById(item.product).lean()
//         if (product) {
//           const category = product.category
//           const data = categoryProfitMap.get(category) || {
//             revenue: 0,
//             cost: 0,
//             profit: 0,
//             sales: 0,
//           }

//           const itemRevenue = item.price * item.quantity
//           const itemCost = item.cost * item.quantity
//           const itemProfit = itemRevenue - itemCost

//           data.revenue += itemRevenue
//           data.cost += itemCost
//           data.profit += itemProfit
//           data.sales += item.quantity

//           categoryProfitMap.set(category, data)
//         }
//       }
//     }

//     // Convert to array and calculate margins
//     const categoryProfit = Array.from(categoryProfitMap.entries())
//       .map(([category, data]) => {
//         const margin = data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0
//         return {
//           name: category,
//           revenue: data.revenue,
//           cost: data.cost,
//           profit: data.profit,
//           sales: data.sales,
//           margin: Number.parseFloat(margin.toFixed(2)),
//         }
//       })
//       .filter((item) => item.revenue > 0) // Only include categories with sales
//       .sort((a, b) => b.profit - a.profit) // Sort by profit (highest first)

//     return NextResponse.json({
//       categoryProfit,
//     })
//   } catch (error) {
//     console.error("Error fetching category profit:", error)
//     return NextResponse.json({ error: "Failed to fetch category profit" }, { status: 500 })
//   }
// }

