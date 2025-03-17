import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface INotification extends Document {
  title: string
  message: string
  type: "Low Stock" | "Out of Stock" | "Price Change" | "System" | "Sale"
  read: boolean
  product?: mongoose.Types.ObjectId
  date: Date
  createdAt: Date
  updatedAt: Date
}

const NotificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["Low Stock", "Out of Stock", "Price Change", "System", "Sale"],
      required: true,
    },
    read: { type: Boolean, default: false },
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

// Prevent model overwrite error in development with hot reloading
const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema)

export default Notification

