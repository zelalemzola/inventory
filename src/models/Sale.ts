import mongoose, { Schema, type Document, Model } from "mongoose"

// Interface for a sale item (product or variant)
export interface ISaleItem {
  productId: mongoose.Types.ObjectId;
  productName: string;
  variantId?: mongoose.Types.ObjectId;
  variantName?: string;
  category: string;
  quantity: number;
  price: number;
  cost: number;
}

// Interface for customer information
export interface ICustomer {
  name: string;
  email?: string;
  phone?: string;
}

// Interface for the sale document
export interface ISale extends Document {
  customer: ICustomer;
  items: ISaleItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  totalCost: number;
  profit: number;
  paymentMethod: string;
  status: 'Pending' | 'Completed' | 'Cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Schema for sale items
const SaleItemSchema = new Schema<ISaleItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  variantId: { type: Schema.Types.ObjectId },
  variantName: { type: String },
  category: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  cost: { type: Number, required: true, min: 0 }
});

// Schema for customer information
const CustomerSchema = new Schema<ICustomer>({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String }
});

// Schema for sales
const SaleSchema = new Schema<ISale>({
  customer: { type: CustomerSchema, required: true },
  items: { 
    type: [SaleItemSchema], 
    required: true,
    validate: {
      validator: function(items: ISaleItem[]) {
        return items && items.length > 0;
      },
      message: 'A sale must have at least one item'
    }
  },
  subtotal: { type: Number, required: true, min: 0 },
  tax: { type: Number, required: true, default: 0, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  totalCost: { type: Number, required: true, min: 0 },
  profit: { type: Number, required: true },
  paymentMethod: { 
    type: String, 
    required: true,
    enum: ['Cash', 'Credit Card', 'Debit Card', 'Check', 'Bank Transfer', 'Other']
  },
  status: { 
    type: String, 
    required: true,
    enum: ['Pending', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  notes: { type: String }
}, { timestamps: true });

// Create and export the model
const Sale: Model<ISale> = mongoose.models.Sale || mongoose.model<ISale>("Sale", SaleSchema);

export default Sale;

