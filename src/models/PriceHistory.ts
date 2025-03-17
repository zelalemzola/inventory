import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface IPriceHistory extends Document {
  product: mongoose.Types.ObjectId
  oldPrice: number
  newPrice: number
  date: Date
  reason: string
  createdAt: Date
  updatedAt: Date
}

const PriceHistorySchema = new Schema<IPriceHistory>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    oldPrice: { type: Number, required: true },
    newPrice: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    reason: { type: String },
  },
  { timestamps: true },
)

// Prevent model overwrite error in development with hot reloading
const PriceHistory: Model<IPriceHistory> =
  mongoose.models.PriceHistory || mongoose.model<IPriceHistory>("PriceHistory", PriceHistorySchema)

export default PriceHistory

