import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"

// This would typically connect to a Settings model
// For now, we'll simulate with a simple in-memory store
let systemSettings = {
  companyName: "AutoParts Inc.",
  taxRate: 7,
  currency: "USD",
  dateFormat: "MM/DD/YYYY",
  autoBackup: true,
  backupFrequency: "daily",
  darkMode: false,
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    // In a real app, you would fetch the system settings from the database
    // For now, we'll return the simulated data

    return NextResponse.json(systemSettings)
  } catch (error) {
    console.error("Error fetching system settings:", error)
    return NextResponse.json({ error: "Failed to fetch system settings" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const body = await req.json()

    // Validate the data
    if (body.taxRate !== undefined && (body.taxRate < 0 || body.taxRate > 100)) {
      return NextResponse.json({ error: "Tax rate must be between 0 and 100" }, { status: 400 })
    }

    // In a real app, you would update the system settings in the database
    // For now, we'll update the simulated data
    systemSettings = {
      ...systemSettings,
      companyName: body.companyName || systemSettings.companyName,
      taxRate: body.taxRate !== undefined ? body.taxRate : systemSettings.taxRate,
      currency: body.currency || systemSettings.currency,
      dateFormat: body.dateFormat || systemSettings.dateFormat,
      autoBackup: body.autoBackup !== undefined ? body.autoBackup : systemSettings.autoBackup,
      backupFrequency: body.backupFrequency || systemSettings.backupFrequency,
      darkMode: body.darkMode !== undefined ? body.darkMode : systemSettings.darkMode,
    }

    return NextResponse.json({
      message: "System settings updated successfully",
      settings: systemSettings,
    })
  } catch (error) {
    console.error("Error updating system settings:", error)
    return NextResponse.json({ error: "Failed to update system settings" }, { status: 500 })
  }
}

