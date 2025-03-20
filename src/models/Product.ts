import mongoose, { Schema, type Document, Model } from "mongoose"

// Interface for product variants
export interface IProductVariant {
  _id?: mongoose.Types.ObjectId;
  name: string;
  sku: string;
  price: number;
  cost: number;
  stock: number;
  minStockThreshold: number;
}

// Interface for the product document
export interface IProduct extends Document {
  name: string;
  description: string;
  category: string;
  isActive: boolean;
  variants: IProductVariant[];
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual properties
  totalStock: number;
  totalValue: number;
  averageCost: number;
  averagePrice: number;
  hasLowStock: boolean;
}

// Schema for product variants
const ProductVariantSchema = new Schema<IProductVariant>({
  name: { type: String, required: true },
  sku: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  cost: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, default: 0, min: 0 },
  minStockThreshold: { type: Number, required: true, default: 5, min: 0 }
}, { _id: true });

// Schema for products
const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  category: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  variants: [ProductVariantSchema]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total stock (sum of all variant stocks)
ProductSchema.virtual('totalStock').get(function(this: IProduct) {
  if (!this.variants || this.variants.length === 0) return 0;
  return this.variants.reduce((sum, variant) => sum + variant.stock, 0);
});

// Virtual for total inventory value (sum of variant stock * cost)
ProductSchema.virtual('totalValue').get(function(this: IProduct) {
  if (!this.variants || this.variants.length === 0) return 0;
  return this.variants.reduce((sum, variant) => sum + (variant.stock * variant.cost), 0);
});

// Virtual for average cost across all variants
ProductSchema.virtual('averageCost').get(function(this: IProduct) {
  if (!this.variants || this.variants.length === 0) return 0;
  const totalCost = this.variants.reduce((sum, variant) => sum + variant.cost, 0);
  return totalCost / this.variants.length;
});

// Virtual for average price across all variants
ProductSchema.virtual('averagePrice').get(function(this: IProduct) {
  if (!this.variants || this.variants.length === 0) return 0;
  const totalPrice = this.variants.reduce((sum, variant) => sum + variant.price, 0);
  return totalPrice / this.variants.length;
});

// Virtual to check if any variant has low stock
ProductSchema.virtual('hasLowStock').get(function(this: IProduct) {
  if (!this.variants || this.variants.length === 0) return false;
  return this.variants.some(variant => variant.stock <= variant.minStockThreshold);
});

// Create and export the model
const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;

