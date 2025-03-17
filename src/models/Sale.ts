import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface ISaleItem {
  product: mongoose.Types.ObjectId
  productName: string
  sku: string
  quantity: number
  price: number
  cost: number
  total: number
}

export interface ISale extends Document {
  customer: string
  date: Date
  items: ISaleItem[]
  subtotal: number
  tax: number
  total: number
  profit: number
  paymentMethod: string
  notes: string
  status: "Completed" | "Pending" | "Cancelled"
  createdAt: Date
  updatedAt: Date
}

const SaleItemSchema = new Schema<ISaleItem>({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  productName: { type: String, required: true },
  sku: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  cost: { type: Number, required: true },
  total: { type: Number, required: true },
})

const SaleSchema = new Schema<ISale>(
  {
    customer: { type: String, required: true },
    date: { type: Date, default: Date.now },
    items: [SaleItemSchema],
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },
    profit: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    notes: { type: String },
    status: {
      type: String,
      enum: ["Completed", "Pending", "Cancelled"],
      default: "Completed",
    },
  },
  { timestamps: true },
)

// Calculate profit before saving
SaleSchema.pre("save", function (next) {
  let totalCost = 0
  this.items.forEach((item) => {
    totalCost += item.cost * item.quantity
  })
  this.profit = this.subtotal - totalCost
  next()
})

// Prevent model overwrite error in development with hot reloading
const Sale: Model<ISale> = mongoose.models.Sale || mongoose.model<ISale>("Sale", SaleSchema)

export default Sale

