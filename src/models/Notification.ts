import mongoose, { Schema, type Document, Model } from "mongoose"

// Interface for the notification document
export interface INotification extends Document {
  type: 'low_stock' | 'system' | 'sale';
  title: string;
  message: string;
  productId?: mongoose.Types.ObjectId;
  variantId?: mongoose.Types.ObjectId;
  isRead: boolean;
  actionRequired: boolean;
  actionTaken: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Schema for notifications
const NotificationSchema = new Schema<INotification>({
  type: { 
    type: String, 
    required: true,
    enum: ['low_stock', 'system', 'sale']
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product' },
  variantId: { type: Schema.Types.ObjectId },
  isRead: { type: Boolean, default: false },
  actionRequired: { type: Boolean, default: false },
  actionTaken: { type: Boolean, default: false }
}, { timestamps: true });

// Create and export the model
const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;

