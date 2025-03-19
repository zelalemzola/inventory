import mongoose, { Schema, type Document } from "mongoose"

// Define the interface for a product in a sale
export interface SaleProduct {
  product: mongoose.Types.ObjectId | string
  name: string
  price: number
  cost: number
  quantity: number
}

// Define the interface for a sale document
export interface ISale extends Document {
  customer: {
    name: string
    email?: string
    phone?: string
  }
  products: SaleProduct[]
  total: number
  paymentMethod: string
  status: "pending" | "completed" | "cancelled"
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// Define the schema for a product in a sale
const SaleProductSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  cost: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
})

// Define the schema for a sale
const SaleSchema = new Schema(
  {
    customer: {
      name: {
        type: String,
        required: true,
      },
      email: String,
      phone: String,
    },
    products: {
      type: [SaleProductSchema],
      required: true,
      validate: {
        validator: (products: any[]) => products && products.length > 0,
        message: "A sale must have at least one product",
      },
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["cash", "credit", "debit", "check", "other"],
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
    notes: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Create and export the Sale model
export default mongoose.models.Sale || mongoose.model<ISale>("Sale", SaleSchema)

