import {  NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Sale from "@/models/Sale"
import Product from "@/models/Product"
import { isValidObjectId } from "mongoose"

export async function GET(req, { params }) {
  try {
    await dbConnect()

    const id = params.id
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid sale ID" }, { status: 400 })
    }

    const sale = await Sale.findById(id).populate("customer", "name email")
    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 })
    }

    return NextResponse.json(sale)
  } catch (error) {
    console.error("Error fetching sale:", error)
    return NextResponse.json({ error: "Failed to fetch sale" }, { status: 500 })
  }
}

export async function PUT(req, { params }) {
  try {
    await dbConnect()

    const id = params.id
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid sale ID" }, { status: 400 })
    }

    const data = await req.json()

    // Get the current sale to check status change
    const currentSale = await Sale.findById(id)
    if (!currentSale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 })
    }

    // Handle inventory changes if status is changing
    if (data.status !== currentSale.status) {
      // If changing from non-completed to completed, reduce inventory
      if (data.status === "Completed" && currentSale.status !== "Completed") {
        await updateInventory(currentSale.items, -1) // Reduce inventory
      }

      // If changing from completed to non-completed, restore inventory
      if (data.status !== "Completed" && currentSale.status === "Completed") {
        await updateInventory(currentSale.items, 1) // Restore inventory
      }
    }

    // Update the sale
    const sale = await Sale.findByIdAndUpdate(id, data, { new: true, runValidators: true })

    return NextResponse.json(sale)
  } catch (error) {
    console.error("Error updating sale:", error)
    return NextResponse.json({ error: "Failed to update sale" }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect()

    const id = params.id
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid sale ID" }, { status: 400 })
    }

    // Get the sale before deleting to check if we need to restore inventory
    const sale = await Sale.findById(id)
    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 })
    }

    // If the sale was completed, restore inventory
    if (sale.status === "Completed") {
      await updateInventory(sale.items, 1) // Restore inventory
    }

    // Delete the sale
    await Sale.findByIdAndDelete(id)

    return NextResponse.json({ message: "Sale deleted successfully" })
  } catch (error) {
    console.error("Error deleting sale:", error)
    return NextResponse.json({ error: "Failed to delete sale" }, { status: 500 })
  }
}

// Helper function to update inventory
async function updateInventory(items, direction) {
  for (const item of items) {
    const quantity = item.quantity * direction // Positive to add, negative to subtract

    if (item.isVariant) {
      // Update variant stock
      const parentProduct = await Product.findById(item.parentProductId)
      if (parentProduct) {
        const updatedVariants = parentProduct.variants.map((v) => {
          if (v.sku === item.sku) {
            return {
              ...v,
              stock: Math.max(0, v.stock + quantity),
            }
          }
          return v
        })

        await Product.findByIdAndUpdate(item.parentProductId, {
          variants: updatedVariants,
        })
      }
    } else {
      // Update regular product stock
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: quantity },
      })
    }
  }
}

