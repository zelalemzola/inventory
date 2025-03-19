import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Notification from "@/models/Notification"

export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    await Notification.updateMany({ read: false }, { $set: { read: true } })

    return NextResponse.json({ message: "All notifications marked as read" })
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    return NextResponse.json({ error: "Failed to mark all notifications as read" }, { status: 500 })
  }
}

