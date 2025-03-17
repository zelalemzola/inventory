import { type NextRequest, NextResponse } from "next/server"

import Notification from "@/models/Notification"
import  dbConnect  from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const url = new URL(req.url)
    const searchParams = url.searchParams
    const read = searchParams.get("read")
    const type = searchParams.get("type")
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const page = Number.parseInt(searchParams.get("page") || "1")

    const skip = (page - 1) * limit

    // Build query
    const query: any = {}

    if (read !== null) {
      query.read = read === "true"
    }

    if (type) {
      query.type = type
    }

    const notifications = await Notification.find(query).sort({ date: -1 }).skip(skip).limit(limit)

    const total = await Notification.countDocuments(query)
    const unreadCount = await Notification.countDocuments({ read: false })

    return NextResponse.json({
      notifications,
      unreadCount,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const body = await req.json()

    const notification = new Notification(body)
    await notification.save()

    return NextResponse.json(notification, { status: 201 })
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
  }
}

