import {  NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Sale from "@/models/Sale"
import Product from "@/models/Product"
import StockHistory from "@/models/StockHistory"
import Notification from "@/models/Notification"

export async function GET(req, { params }) {
  try {
    await dbConnect()

    const sale = await Sale.findById(params.id)

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

    const { id } = params
    const data = await req.json()

    // Get the current sale to check if status is changing
    const currentSale = await Sale.findById(id).populate("items.product")
    if (!currentSale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 })
    }

    // Check if status is changing from Pending to Completed
    const statusChangingToCompleted = currentSale.status === "Pending" && data.status === "Completed"

    // Update the sale
    const updatedSale = await Sale.findByIdAndUpdate(id, data, { new: true }).populate("items.product")

    // If status is changing from Pending to Completed, update inventory
    if (statusChangingToCompleted) {
      // Get the items from the sale
      const items = currentSale.items

      // Process each item in the sale
      for (const item of items) {
        const productId = item.product._id
        const variantName = item.variant
        const quantity = item.quantity

        // Find the product
        const product = await Product.findById(productId)
        if (!product) {
          continue // Skip if product not found
        }

        // Update stock based on whether it's a variant or main product
        if (variantName) {
          // Find the variant
          const variant = product.variants.find((v) => v.name === variantName)
          if (variant) {
            // Update variant stock
            variant.stock -= quantity

            // Create stock history record for the variant
            await StockHistory.create({
              product: productId,
              variant: variantName,
              change: -quantity,
              type: "sale",
              date: new Date(),
              notes: `Sale ID: ${id} (status changed to Completed)`,
            })
          }
        } else {
          // Update main product stock
          product.stock -= quantity

          // Create stock history record for the main product
          await StockHistory.create({
            product: productId,
            change: -quantity,
            type: "sale",
            date: new Date(),
            notes: `Sale ID: ${id} (status changed to Completed)`,
          })
        }

        // Update product status based on stock levels
        if (product.stock <= 0) {
          product.status = "Out of Stock"
        } else if (product.stock <= product.lowStockThreshold) {
          product.status = "Low Stock"
        } else {
          product.status = "In Stock"
        }

        // Update variant statuses
        if (product.variants && product.variants.length > 0) {
          product.variants.forEach((variant) => {
            if (variant.stock <= 0) {
              variant.status = "Out of Stock"
            } else if (variant.stock <= product.lowStockThreshold) {
              variant.status = "Low Stock"
            } else {
              variant.status = "In Stock"
            }
          })
        }

        // Save the updated product
        await product.save()
      }

      // Create a notification for the completed sale
      await Notification.create({
        type: "sale",
        title: "Sale Completed",
        message: `Sale #${id} has been marked as completed for $${currentSale.total.toFixed(2)}.`,
        date: new Date(),
        read: false,
      })
    }

    return NextResponse.json({ success: true, sale: updatedSale })
  } catch (error) {
    console.error("Error updating sale:", error)
    return NextResponse.json({ error: "Failed to update sale" }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect()

    const sale = await Sale.findById(params.id)

    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 })
    }

    // Don't actually delete sales for accounting purposes
    // Just mark as cancelled
    sale.status = "Cancelled"
    await sale.save()

    return NextResponse.json({ message: "Sale cancelled successfully" })
  } catch (error) {
    console.error("Error cancelling sale:", error)
    return NextResponse.json({ error: "Failed to cancel sale" }, { status: 500 })
  }
}

