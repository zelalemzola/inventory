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

// Update the POST handler to only reduce inventory when status is "Completed"

export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const data = await req.json()
    const { items, status, ...saleData } = data

    // Create the sale record
    const sale = new Sale({
      ...saleData,
      items: [], // Initialize items as an empty array, will be populated later if status is completed
      profit: 0, // Initialize profit, will be calculated in pre-save hook
    })

    // Only update inventory if the sale is completed
    if (status === "Completed") {
      let subtotal = 0
      const processedItems = []

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

        // Update stock based on whether it's a variant or main product
        if (variantName) {
          // Find the variant
          const variantIndex = product.variants.findIndex((v) => v.name === variantName)
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

          // Update variant stock
          const previousStock = variant.stock
          variant.stock -= quantity

          // Create stock history record for the variant
          await StockHistory.create({
            product: productId,
            previousStock,
            newStock: variant.stock,
            change: -quantity,
            type: "Sale",
            notes: `Sale ID: ${sale._id}`,
          })

          // Calculate item total
          itemTotal = item.price * quantity
          subtotal += itemTotal

          processedItems.push({
            product: productId, // Use productId directly which should be an ObjectId
            productName: `${product.name} (${variant.name})`,
            sku: variant.sku,
            quantity: item.quantity,
            price: item.price,
            cost: variant.cost,
            total: itemTotal,
          })

          product.variants[variantIndex] = variant
        } else {
          if (product.stock < quantity) {
            return NextResponse.json(
              { error: `Not enough stock for ${product.name}. Available: ${product.stock}` },
              { status: 400 },
            )
          }
          // Update main product stock
          const previousStock = product.stock
          product.stock -= quantity

          // Create stock history record for the main product
          await StockHistory.create({
            product: productId,
            previousStock,
            newStock: product.stock,
            change: -quantity,
            type: "Sale",
            notes: `Sale ID: ${sale._id}`,
          })

          // Calculate item total
          itemTotal = item.price * quantity
          subtotal += itemTotal

          processedItems.push({
            product: productId, // Use productId directly which should be an ObjectId
            productName: product.name,
            sku: product.sku,
            quantity: item.quantity,
            price: item.price,
            cost: product.cost,
            total: itemTotal,
          })
        }

        // Update product status based on stock levels
        updateProductStatus(product)

        // Save the updated product
        await product.save()
      }

      const tax = subtotal * 0.07 // 7% tax rate
      const total = subtotal + tax

      sale.items = processedItems
      sale.subtotal = subtotal
      sale.tax = tax
      sale.total = total

      // Create a notification for the completed sale
      await Notification.create({
        type: "Sale",
        title: "New Sale Completed",
        message: `A new sale of $${total.toFixed(2)} has been completed.`,
        date: new Date(),
        read: false,
      })
    } else {
      // Create a notification for the pending sale
      await Notification.create({
        type: "Sale",
        title: "New Pending Sale",
        message: `A new pending sale of $${data.total.toFixed(2)} has been created.`,
        date: new Date(),
        read: false,
      })
    }

    await sale.save()

    return NextResponse.json({ success: true, sale }, { status: 201 })
  } catch (error) {
    console.error("Error creating sale:", error)
    return NextResponse.json({ error: "Failed to create sale" }, { status: 500 })
  }
}

// Helper function to update product status based on stock levels
function updateProductStatus(product: any) {
  // Update main product status
  if (product.stock <= 0) {
    product.status = "Out of Stock"
  } else if (product.stock <= product.minStockLevel) {
    product.status = "Low Stock"
  } else {
    product.status = "In Stock"
  }

  // Update variant statuses
  if (product.variants && product.variants.length > 0) {
    product.variants.forEach((variant: any) => {
      if (variant.stock <= 0) {
        variant.status = "Out of Stock"
      } else if (variant.stock <= product.minStockLevel) {
        variant.status = "Low Stock"
      } else {
        variant.status = "In Stock"
      }
    })
  }
}

