import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Notification from "@/models/Notification"

export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const body = await req.json()
    const { ids } = body

    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json({ error: "IDs array is required" }, { status: 400 })
    }

    await Notification.updateMany({ _id: { $in: ids } }, { $set: { read: true } })

    return NextResponse.json({ message: "Notifications marked as read" })
  } catch (error) {
    console.error("Error marking notifications as read:", error)
    return NextResponse.json({ error: "Failed to mark notifications as read" }, { status: 500 })
  }
}

