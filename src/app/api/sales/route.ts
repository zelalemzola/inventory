import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Sale from "@/models/Sale"
import Product from "@/models/Product"
import StockHistory from "@/models/StockHistory"
import Notification from "@/models/Notification"

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

    const body = await req.json()
    const { items, ...saleData } = body

    if (!items || !items.length) {
      return NextResponse.json({ error: "Sale must include at least one item" }, { status: 400 })
    }

    // Process each item, update stock, and calculate totals
    let subtotal = 0
    const processedItems = []

    for (const item of items) {
      const product = await Product.findById(item.product)

      if (!product) {
        return NextResponse.json({ error: `Product with ID ${item.product} not found` }, { status: 404 })
      }

      // Check if this is a variant
      if (item.variant) {
        // Find the variant in the product
        const variantIndex = product.variants.findIndex((v: any) => v.name === item.variant)

        if (variantIndex === -1) {
          return NextResponse.json(
            { error: `Variant ${item.variant} not found for product ${product.name}` },
            { status: 404 },
          )
        }

        const variant = product.variants[variantIndex]

        if (variant.stock < item.quantity) {
          return NextResponse.json(
            { error: `Not enough stock for ${product.name} (${variant.name}). Available: ${variant.stock}` },
            { status: 400 },
          )
        }

        // Update variant stock
        const previousStock = variant.stock
        variant.stock -= item.quantity

        // Update the variant in the product
        product.variants[variantIndex] = variant

        // Create stock history record for the variant
        await StockHistory.create({
          product: product._id,
          previousStock,
          newStock: variant.stock,
          change: -item.quantity,
          type: "Sale",
          notes: `Sold ${item.quantity} units of variant ${variant.name} in sale`,
        })

        // Create notification if new stock level is low or out
        if (variant.stock <= 0) {
          await Notification.create({
            title: "Out of Stock Alert",
            message: `${product.name} (${variant.name}) is now out of stock`,
            type: "Out of Stock",
            product: product._id,
          })
        } else if (variant.stock <= 5) {
          // Using a default threshold for variants
          await Notification.create({
            title: "Low Stock Alert",
            message: `${product.name} (${variant.name}) is low in stock (${variant.stock} remaining)`,
            type: "Low Stock",
            product: product._id,
          })
        }

        // Calculate item total
        const itemTotal = item.price * item.quantity
        subtotal += itemTotal

        // Add processed item
        processedItems.push({
          product: product._id,
          productName: `${product.name} (${variant.name})`,
          sku: variant.sku,
          quantity: item.quantity,
          price: item.price,
          cost: variant.cost,
          total: itemTotal,
        })
      } else {
        // Regular product (not a variant)
        if (product.stock < item.quantity) {
          return NextResponse.json(
            { error: `Not enough stock for ${product.name}. Available: ${product.stock}` },
            { status: 400 },
          )
        }

        // Update product stock
        const previousStock = product.stock
        product.stock -= item.quantity

        // Create stock history record
        await StockHistory.create({
          product: product._id,
          previousStock,
          newStock: product.stock,
          change: -item.quantity,
          type: "Sale",
          notes: `Sold ${item.quantity} units in sale`,
        })

        // Create notification if new stock level is low or out
        if (product.stock <= 0) {
          await Notification.create({
            title: "Out of Stock Alert",
            message: `${product.name} is now out of stock`,
            type: "Out of Stock",
            product: product._id,
          })
        } else if (product.stock <= product.minStockLevel) {
          await Notification.create({
            title: "Low Stock Alert",
            message: `${product.name} is low in stock (${product.stock} remaining)`,
            type: "Low Stock",
            product: product._id,
          })
        }

        // Calculate item total
        const itemTotal = item.price * item.quantity
        subtotal += itemTotal

        // Add processed item
        processedItems.push({
          product: product._id,
          productName: product.name,
          sku: product.sku,
          quantity: item.quantity,
          price: item.price,
          cost: product.cost,
          total: itemTotal,
        })
      }

      // Save the product with updated stock
      await product.save()
    }

    // Calculate tax and total
    const tax = subtotal * 0.07 // 7% tax rate
    const total = subtotal + tax

    // Create the sale
    const sale = new Sale({
      ...saleData,
      items: processedItems,
      subtotal,
      tax,
      total,
      profit: 0, // This will be calculated in the pre-save hook
    })

    await sale.save()

    // Create notification for new sale
    await Notification.create({
      title: "New Sale",
      message: `New sale of $${total.toFixed(2)} to ${saleData.customer}`,
      type: "Sale",
    })

    return NextResponse.json(sale, { status: 201 })
  } catch (error) {
    console.error("Error creating sale:", error)
    return NextResponse.json({ error: "Failed to create sale" }, { status: 500 })
  }
}

