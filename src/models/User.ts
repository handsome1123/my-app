// models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  role: 'admin' | 'seller' | 'buyer';
  active: boolean;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, enum: ['admin', 'seller', 'buyer'], default: 'buyer' },
  active: { type: Boolean, default: true },
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
