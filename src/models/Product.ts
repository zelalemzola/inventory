import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface IVariant {
  name: string
  sku: string
  price: number
  cost: number
  stock: number
}

export interface IProduct extends Document {
  name: string
  description: string
  category: string
  sku: string
  price: number
  cost: number
  stock: number
  minStockLevel: number
  location: string
  supplier: string
  status: "In Stock" | "Low Stock" | "Out of Stock"
  variants: IVariant[]
  lastRestocked: Date
  createdAt: Date
  updatedAt: Date
}

const VariantSchema = new Schema<IVariant>({
  name: { type: String, required: true },
  sku: { type: String, required: true },
  price: { type: Number, required: true },
  cost: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
})

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    cost: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    minStockLevel: { type: Number, default: 5 },
    location: { type: String },
    supplier: { type: String },
    status: {
      type: String,
      enum: ["In Stock", "Low Stock", "Out of Stock"],
      default: "Out of Stock",
    },
    variants: [VariantSchema],
    lastRestocked: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

// Calculate status based on stock and minStockLevel
ProductSchema.pre("save", function (next) {
  if (this.stock <= 0) {
    this.status = "Out of Stock"
  } else if (this.stock <= this.minStockLevel) {
    this.status = "Low Stock"
  } else {
    this.status = "In Stock"
  }
  next()
})

// Prevent model overwrite error in development with hot reloading
const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema)

export default Product

