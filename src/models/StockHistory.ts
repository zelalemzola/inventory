import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface IStockHistory extends Document {
  product: mongoose.Types.ObjectId
  previousStock: number
  newStock: number
  change: number
  type: "Restock" | "Sale" | "Adjustment" | "Initial"
  date: Date
  notes: string
  createdAt: Date
  updatedAt: Date
}

const StockHistorySchema = new Schema<IStockHistory>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    change: { type: Number, required: true },
    type: {
      type: String,
      enum: ["Restock", "Sale", "Adjustment", "Initial"],
      required: true,
    },
    date: { type: Date, default: Date.now },
    notes: { type: String },
  },
  { timestamps: true },
)

// Prevent model overwrite error in development with hot reloading
const StockHistory: Model<IStockHistory> =
  mongoose.models.StockHistory || mongoose.model<IStockHistory>("StockHistory", StockHistorySchema)

export default StockHistory

