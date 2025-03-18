import mongoose, { Schema, type Document } from "mongoose"

export interface IProductVariant {
  name: string
  sku: string
  price: number
  cost: number
  stock: number
  minStockLevel?: number
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
  status: string
  variants?: IProductVariant[]
  createdAt: Date
  updatedAt: Date
}

const ProductVariantSchema = new Schema<IProductVariant>({
  name: { type: String, required: true },
  sku: { type: String, required: true },
  price: { type: Number, required: true },
  cost: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  minStockLevel: { type: Number, default: 5 },
})

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    category: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    cost: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    minStockLevel: { type: Number, default: 5 },
    status: {
      type: String,
      enum: ["In Stock", "Low Stock", "Out of Stock"],
      default: "In Stock",
    },
    variants: [ProductVariantSchema],
  },
  { timestamps: true },
)

// Pre-save middleware to update stock and status based on variants
ProductSchema.pre("save", function (next) {
  // If this product has variants, calculate the total stock from variants
  if (this.variants && this.variants.length > 0) {
    // Sum up the stock of all variants
    this.stock = this.variants.reduce((total, variant) => total + variant.stock, 0)

    // Update status based on the calculated stock
    if (this.stock <= 0) {
      this.status = "Out of Stock"
    } else if (this.stock <= this.minStockLevel) {
      this.status = "Low Stock"
    } else {
      this.status = "In Stock"
    }
  } else {
    // For products without variants, update status based on the product's stock
    if (this.stock <= 0) {
      this.status = "Out of Stock"
    } else if (this.stock <= this.minStockLevel) {
      this.status = "Low Stock"
    } else {
      this.status = "In Stock"
    }
  }

  next()
})

export default mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema)

