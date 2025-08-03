// models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password?: string;
  role: 'admin' | 'seller' | 'buyer';
  active: boolean;
  name?: string;
  image?: string;
  provider?: string;
  phone?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional for OAuth users
  role: { type: String, enum: ['admin', 'seller', 'buyer'], default: 'buyer' },
  active: { type: Boolean, default: true },
  name: { type: String },
  image: { type: String },
  provider: { type: String }, // 'google', 'facebook', 'credentials'
  phone: { type: String },
  emailVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
}, {
  timestamps: true
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
