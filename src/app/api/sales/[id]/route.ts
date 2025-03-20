import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Sale from "@/models/Sale"
import Product from "@/models/Product"
import { successResponse, errorResponse } from "@/lib/apiResponse"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const sale = await Sale.findById(params.id)

    if (!sale) {
      return NextResponse.json(errorResponse("Sale not found", 404), { status: 404 })
    }

    return NextResponse.json(successResponse(sale, "Sale retrieved successfully"))
  } catch (error: any) {
    console.error(`Error fetching sale ${params.id}:`, error)
    return NextResponse.json(errorResponse("Failed to fetch sale", 500, error), { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const body = await request.json()

    // Find the sale
    const sale = await Sale.findById(params.id)

    if (!sale) {
      return NextResponse.json(errorResponse("Sale not found", 404), { status: 404 })
    }

    // Update only allowed fields (not items or amounts)
    if (body.customer) sale.customer = body.customer
    if (body.status) sale.status = body.status
    if (body.paymentMethod) sale.paymentMethod = body.paymentMethod
    if (body.notes !== undefined) sale.notes = body.notes

    // If status is changing from Pending to Completed or vice versa, handle inventory
    if (body.status && body.status !== sale.status) {
      if (body.status === "Cancelled" && sale.status === "Completed") {
        // Return items to inventory
        await returnItemsToInventory(sale.items)
      } else if (body.status === "Completed" && sale.status === "Cancelled") {
        // Remove items from inventory again
        await removeItemsFromInventory(sale.items)
      }
    }

    await sale.save()

    return NextResponse.json(successResponse(sale, "Sale updated successfully"))
  } catch (error: any) {
    console.error(`Error updating sale ${params.id}:`, error)
    return NextResponse.json(errorResponse("Failed to update sale", 500, error), { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const sale = await Sale.findById(params.id)

    if (!sale) {
      return NextResponse.json(errorResponse("Sale not found", 404), { status: 404 })
    }

    // If the sale was completed, return items to inventory
    if (sale.status === "Completed") {
      await returnItemsToInventory(sale.items)
    }

    await Sale.findByIdAndDelete(params.id)

    return NextResponse.json(successResponse(null, "Sale deleted successfully"))
  } catch (error: any) {
    console.error(`Error deleting sale ${params.id}:`, error)
    return NextResponse.json(errorResponse("Failed to delete sale", 500, error), { status: 500 })
  }
}

// Helper function to return items to inventory
async function returnItemsToInventory(items: any[]) {
  for (const item of items) {
    const product = await Product.findById(item.productId)

    if (product) {
      if (item.variantId) {
        // Find the variant - using array find instead of .id()
        // @ts-ignore - Mongoose's subdocument methods aren't recognized by TypeScript
        const variant = product.variants.find((v) => v._id.toString() === item.variantId)

        if (variant) {
          // Return quantity to stock
          variant.stock += item.quantity
          await product.save()
        }
      }
    }
  }
}

// Helper function to remove items from inventory
async function removeItemsFromInventory(items: any[]) {
  for (const item of items) {
    const product = await Product.findById(item.productId)

    if (product) {
      if (item.variantId) {
        // Find the variant - using array find instead of .id()
        // @ts-ignore - Mongoose's subdocument methods aren't recognized by TypeScript
        const variant = product.variants.find((v) => v._id.toString() === item.variantId)

        if (variant) {
          // Remove quantity from stock
          variant.stock = Math.max(0, variant.stock - item.quantity)
          await product.save()
        }
      }
    }
  }
}

