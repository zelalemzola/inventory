// import  dbConnect  from "@/lib/db"
// import { type NextRequest, NextResponse } from "next/server"


// export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     await dbConnect()

//     const { id } = params

//     // In a real app, you would:
//     // 1. Delete the backup file from the storage service
//     // 2. Delete the backup record from the database

//     // For now, we'll just return a success response
//     return NextResponse.json({
//       message: "Backup deleted successfully",
//     })
//   } catch (error) {
//     console.error("Error deleting backup:", error)
//     return NextResponse.json({ error: "Failed to delete backup" }, { status: 500 })
//   }
// }

