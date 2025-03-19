import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Sale from "@/models/Sale"
import Product from "@/models/Product"
import StockHistory from "@/models/StockHistory"
import Notification from "@/models/Notification"
import { Types } from "mongoose"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const url = new URL(req.url)
    const searchParams = url.searchParams
    const customer = searchParams.get("customer")
    const status = searchParams.get("status")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const page = Number.parseInt(searchParams.get("page") || "1")

    const skip = (page - 1) * limit

    // Build query
    const query: any = {}

    if (customer) {
      query.customer = { $regex: customer, $options: "i" }
    }

    if (status) {
      query.status = status
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    } else if (startDate) {
      query.date = { $gte: new Date(startDate) }
    } else if (endDate) {
      query.date = { $lte: new Date(endDate) }
    }

    const sales = await Sale.find(query).sort({ date: -1 }).skip(skip).limit(limit)

    const total = await Sale.countDocuments(query)

    return NextResponse.json({
      sales,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching sales:", error)
    return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const data = await req.json()
    const { items, status, ...saleData } = data

    // Create the sale record with initial values
    const sale = new Sale({
      ...saleData,
      status: status || "Pending", // Default to Pending if not specified
      items: [],
      profit: 0,
    })

    const processedItems = []
    let subtotal = 0

    // Process each item in the sale
    for (const item of items) {
      const productId = item.product
      const variantName = item.variant
      const quantity = item.quantity

      // Find the product
      const product = await Product.findById(productId)
      if (!product) {
        return NextResponse.json({ error: `Product with ID ${productId} not found` }, { status: 404 })
      }

      let itemTotal = 0
      let itemCost = 0
      const stockToUpdate = true // Always update stock regardless of status

      // Process variant or main product
      if (variantName) {
        // Find the variant
        const variantIndex = product.variants.findIndex((v: any) => v.name === variantName)
        if (variantIndex === -1) {
          return NextResponse.json(
            { error: `Variant ${variantName} not found for product ${product.name}` },
            { status: 404 },
          )
        }

        const variant = product.variants[variantIndex]

        if (variant.stock < quantity) {
          return NextResponse.json(
            { error: `Not enough stock for ${product.name} (${variant.name}). Available: ${variant.stock}` },
            { status: 400 },
          )
        }

        // Always update stock regardless of status
        const previousStock = variant.stock
        variant.stock -= quantity

        // Create stock history record
        await StockHistory.create({
          product: productId,
          previousStock,
          newStock: variant.stock,
          change: -quantity,
          type: "Sale",
          notes: `Sale ID: ${sale._id} (${status})`,
        })

        product.variants[variantIndex] = variant

        // Calculate item total and cost
        itemTotal = item.price * quantity
        itemCost = variant.cost * quantity
        subtotal += itemTotal

        processedItems.push({
          product: new Types.ObjectId(productId),
          productName: product.name,
          variant: variantName,
          sku: variant.sku,
          quantity: item.quantity,
          price: item.price,
          cost: variant.cost,
          total: itemTotal,
        })
      } else {
        // Main product
        if (product.stock < quantity) {
          return NextResponse.json(
            { error: `Not enough stock for ${product.name}. Available: ${product.stock}` },
            { status: 400 },
          )
        }

        // Always update stock regardless of status
        const previousStock = product.stock
        product.stock -= quantity

        // Create stock history record
        await StockHistory.create({
          product: productId,
          previousStock,
          newStock: product.stock,
          change: -quantity,
          type: "Sale",
          notes: `Sale ID: ${sale._id} (${status})`,
        })

        // Calculate item total and cost
        itemTotal = item.price * quantity
        itemCost = product.cost * quantity
        subtotal += itemTotal

        processedItems.push({
          product: new Types.ObjectId(productId),
          productName: product.name,
          sku: product.sku,
          quantity: item.quantity,
          price: item.price,
          cost: product.cost,
          total: itemTotal,
        })
      }

      // Save product if stock was updated
      if (stockToUpdate) {
        await product.save()
      }
    }

    // Calculate profit for all sales (both pending and completed)
    const profit = processedItems.reduce((total, item) => {
      return total + (item.price * item.quantity - item.cost * item.quantity)
    }, 0)

    // Update sale with processed items and calculations
    sale.items = processedItems
    sale.subtotal = subtotal
    sale.tax = 0 // No tax as requested
    sale.total = subtotal
    sale.profit = profit

    await sale.save()

    // Create notification based on status
    await Notification.create({
      type: "Sale",
      title: status === "Completed" ? "New Sale Completed" : "New Pending Sale",
      message: `A new ${status.toLowerCase()} sale of $${subtotal.toFixed(2)} has been ${
        status === "Completed" ? "completed" : "created"
      }.`,
      date: new Date(),
      read: false,
    })

    return NextResponse.json({ success: true, sale }, { status: 201 })
  } catch (error) {
    console.error("Error creating sale:", error)
    return NextResponse.json({ error: "Failed to create sale" }, { status: 500 })
  }
}

