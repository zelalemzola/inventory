import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Product from "@/models/Product"
import StockHistory from "@/models/StockHistory"
import Notification from "@/models/Notification"
import { successResponse, errorResponse } from "@/lib/apiResponse"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const body = await request.json()
    const { variantId, quantity } = body

    if (!variantId || !quantity || quantity <= 0) {
      return NextResponse.json(errorResponse("Variant ID and positive quantity are required", 400), { status: 400 })
    }

    // Find the product
    const product = await Product.findById(params.id)

    if (!product) {
      return NextResponse.json(errorResponse("Product not found", 404), { status: 404 })
    }

    // Find the variant - using Mongoose's array methods
    // @ts-ignore - Mongoose's subdocument methods aren't recognized by TypeScript
    const variant = product.variants.find((v) => v._id.toString() === variantId)

    if (!variant) {
      return NextResponse.json(errorResponse("Variant not found", 404), { status: 404 })
    }

    // Update stock
    const previousStock = variant.stock
    variant.stock += quantity

    // Create stock history record
    await StockHistory.create({
      product: params.id,
      variant: variantId,
      previousStock,
      newStock: variant.stock,
      change: quantity,
      type: "Restock",
      notes: `Restocked ${quantity} units`,
    })

    // Save the product
    await product.save()

    // Create notification
    await Notification.create({
      type: "system",
      title: "Product Restocked",
      message: `${product.name} - ${variant.name} has been restocked with ${quantity} units`,
      productId: product._id,
      variantId: variant._id,
      isRead: false,
      actionRequired: false,
      actionTaken: false,
    })

    return NextResponse.json(successResponse(product, "Product restocked successfully"))
  } catch (error: any) {
    console.error(`Error restocking product ${params.id}:`, error)
    return NextResponse.json(errorResponse("Failed to restock product", 500, error), { status: 500 })
  }
}

