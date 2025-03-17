import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"

// This would typically connect to a Settings model
// For now, we'll simulate with a simple in-memory store
let notificationSettings = {
  stockAlerts: true,
  priceChanges: true,
  salesNotifications: true,
  systemUpdates: true,
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: false,
  lowStockThreshold: 5,
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    // In a real app, you would fetch the notification settings from the database
    // For now, we'll return the simulated data

    return NextResponse.json(notificationSettings)
  } catch (error) {
    console.error("Error fetching notification settings:", error)
    return NextResponse.json({ error: "Failed to fetch notification settings" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const body = await req.json()

    // In a real app, you would update the notification settings in the database
    // For now, we'll update the simulated data
    notificationSettings = {
      ...notificationSettings,
      stockAlerts: body.stockAlerts !== undefined ? body.stockAlerts : notificationSettings.stockAlerts,
      priceChanges: body.priceChanges !== undefined ? body.priceChanges : notificationSettings.priceChanges,
      salesNotifications:
        body.salesNotifications !== undefined ? body.salesNotifications : notificationSettings.salesNotifications,
      systemUpdates: body.systemUpdates !== undefined ? body.systemUpdates : notificationSettings.systemUpdates,
      emailNotifications:
        body.emailNotifications !== undefined ? body.emailNotifications : notificationSettings.emailNotifications,
      smsNotifications:
        body.smsNotifications !== undefined ? body.smsNotifications : notificationSettings.smsNotifications,
      pushNotifications:
        body.pushNotifications !== undefined ? body.pushNotifications : notificationSettings.pushNotifications,
      lowStockThreshold:
        body.lowStockThreshold !== undefined ? body.lowStockThreshold : notificationSettings.lowStockThreshold,
    }

    return NextResponse.json({
      message: "Notification settings updated successfully",
      settings: notificationSettings,
    })
  } catch (error) {
    console.error("Error updating notification settings:", error)
    return NextResponse.json({ error: "Failed to update notification settings" }, { status: 500 })
  }
}

