import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Sale from "@/models/Sale"
import Product from "@/models/Product"
import Notification from "@/models/Notification"
import { successResponse, errorResponse } from "@/lib/apiResponse"

export async function GET(request: Request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const customer = searchParams.get("customer")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const query: any = {}

    // Date range filter
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    } else if (startDate) {
      query.createdAt = { $gte: new Date(startDate) }
    } else if (endDate) {
      query.createdAt = { $lte: new Date(endDate) }
    }

    // Customer filter
    if (customer) {
      query["customer.name"] = { $regex: customer, $options: "i" }
    }

    const sales = await Sale.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)
    const total = await Sale.countDocuments(query)

    return NextResponse.json(
      successResponse(
        {
          sales,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
          },
        },
        "Sales retrieved successfully",
      ),
    )
  } catch (error: any) {
    console.error("Error fetching sales:", error)
    return NextResponse.json(errorResponse("Failed to fetch sales", 500, error), { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect()

    const body = await request.json()

    // Validate required fields
    if (!body.customer || !body.customer.name || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(errorResponse("Missing required fields", 400), { status: 400 })
    }

    // Process each item and update product stock
    for (let i = 0; i < body.items.length; i++) {
      const item = body.items[i]

      if (!item.productId || !item.quantity) {
        return NextResponse.json(errorResponse(`Item at index ${i} is missing required fields`, 400), { status: 400 })
      }

      // Find the product
      const product = await Product.findById(item.productId)
      if (!product) {
        return NextResponse.json(errorResponse(`Product with ID ${item.productId} not found`, 404), { status: 404 })
      }

      // If variant is specified, handle variant
      if (item.variantId) {
        // Find the variant - using array find instead of .id()
        // @ts-ignore - Mongoose's subdocument methods aren't recognized by TypeScript
        const variant = product.variants.find((v) => v._id.toString() === item.variantId)

        if (!variant) {
          return NextResponse.json(
            errorResponse(`Variant with ID ${item.variantId} not found in product ${product.name}`, 404),
            { status: 404 },
          )
        }

        // Check stock
        if (variant.stock < item.quantity) {
          return NextResponse.json(
            errorResponse(`Not enough stock for ${product.name} - ${variant.name}. Available: ${variant.stock}`, 400),
            { status: 400 },
          )
        }

        // Update item with product details
        body.items[i] = {
          ...item,
          productName: product.name,
          variantName: variant.name,
          cost: variant.cost,
          price: variant.price,
          category: product.category,
        }

        // Update stock
        variant.stock -= item.quantity

        // Create low stock notification if needed
        if (variant.stock <= variant.minStockThreshold) {
          await Notification.create({
            type: "low_stock",
            title: "Low Stock Alert",
            message: `${product.name} - ${variant.name} is running low (${variant.stock} remaining)`,
            productId: product._id,
            variantId: variant._id,
            actionRequired: true,
            actionTaken: false,
            isRead: false,
          })
        }
      } else {
        // Handle product without variant (should not happen with your new model, but just in case)
        return NextResponse.json(errorResponse(`Variant ID is required for product ${product.name}`, 400), {
          status: 400,
        })
      }

      await product.save()
    }

    // Calculate totals
    let subtotal = 0
    let totalCost = 0

    for (const item of body.items) {
      subtotal += item.price * item.quantity
      totalCost += item.cost * item.quantity
    }

    // Create the sale
    const newSale = new Sale({
      customer: body.customer,
      items: body.items,
      subtotal,
      tax: body.tax || 0,
      totalAmount: subtotal + (body.tax || 0),
      totalCost,
      profit: subtotal - totalCost,
      paymentMethod: body.paymentMethod,
      status: body.status || "Pending",
      notes: body.notes,
    })

    await newSale.save()

    // Create notification for new sale
    await Notification.create({
      type: "sale",
      title: "New Sale Created",
      message: `A new sale of $${subtotal.toFixed(2)} has been created`,
      isRead: false,
      actionRequired: false,
      actionTaken: false,
    })

    return NextResponse.json(successResponse(newSale, "Sale created successfully"), { status: 201 })
  } catch (error: any) {
    console.error("Error creating sale:", error)
    return NextResponse.json(errorResponse("Failed to create sale", 500, error), { status: 500 })
  }
}

