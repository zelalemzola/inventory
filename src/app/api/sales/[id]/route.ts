import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Sale from "@/models/Sale"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
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

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const body = await req.json()

    // Only allow updating status, notes, and payment method
    const allowedUpdates = {
      status: body.status,
      notes: body.notes,
      paymentMethod: body.paymentMethod,
    }

    const sale = await Sale.findByIdAndUpdate(params.id, { $set: allowedUpdates }, { new: true, runValidators: true })

    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 })
    }

    return NextResponse.json(sale)
  } catch (error) {
    console.error("Error updating sale:", error)
    return NextResponse.json({ error: "Failed to update sale" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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

