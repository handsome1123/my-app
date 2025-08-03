// @/lib/database.ts

import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Product from '@/models/Product';

export class DatabaseService {
  static async connect() {
    await dbConnect();
  }

  // ================== USER METHODS ==================
  
  // ✅ Add this method to your DatabaseService
  static async getAllUsers() {
    try {
      await this.connect();
      const users = await User.find({}, '-password').exec();
      return users;
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  }

  static async findUserByEmail(email: string) {
    try {
      await this.connect();
      const user = await User.findOne({ email }).exec();
      return user;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  static async findUserByPhone(phone: string) {
    try {
      await this.connect();
      const user = await User.findOne({ phone }).exec();
      return user;
    } catch (error) {
      console.error('Error finding user by phone:', error);
      throw error;
    }
  }

  static async createUser(userData: {
    email?: string;
    phone?: string;
    name?: string;
    role: 'buyer' | 'seller' | 'admin';
    provider: 'credentials' | string;
    emailVerified: boolean;
    phoneVerified: boolean;
  }) {
    try {
      await this.connect();
      const user = new User(userData);
      await user.save();
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async findUserById(id: string) {
    try {
      await this.connect();
      const user = await User.findById(id).exec();
      return user;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  static async updateUser(id: string, updateData: Partial<{
    email: string;
    phone: string;
    name: string;
    role: 'buyer' | 'seller' | 'admin';
    emailVerified: boolean;
    phoneVerified: boolean;
  }>) {
    try {
      await this.connect();
      const user = await User.findByIdAndUpdate(id, updateData, { new: true }).exec();
      return user;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async deleteUser(id: string) {
    try {
      await this.connect();
      const user = await User.findByIdAndDelete(id).exec();
      return user;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // ================== PRODUCT METHODS ==================
  
  static async getAllProducts() {
    try {
      await this.connect();
      const products = await Product.find()
        .populate('owner', 'name email')
        .sort({ createdAt: -1 })
        .exec();
      return products;
    } catch (error) {
      console.error('Error fetching all products:', error);
      throw error;
    }
  }

  static async getProductsByOwner(ownerId: string) {
    try {
      await this.connect();
      const products = await Product.find({ owner: ownerId })
        .populate('owner', 'name email')
        .sort({ createdAt: -1 })
        .exec();
      return products;
    } catch (error) {
      console.error('Error fetching products by owner:', error);
      throw error;
    }
  }

  static async createProduct(productData: {
    name: string;
    price: number;
    owner: string;
    imageUrl: string;
    description?: string;
    category?: string;
    stock?: number;
  }) {
    try {
      await this.connect();
      const product = new Product(productData);
      await product.save();
      
      // Populate owner info before returning
      await product.populate('owner', 'name email');
      return product;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  static async updateProduct(id: string, updateData: {
    name?: string;
    price?: number;
    imageUrl?: string;
    description?: string;
    category?: string;
    stock?: number;
  }) {
    try {
      await this.connect();
      const product = await Product.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      )
      .populate('owner', 'name email')
      .exec();
      
      return product;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  static async deleteProduct(id: string) {
    try {
      await this.connect();
      const product = await Product.findByIdAndDelete(id).exec();
      return product;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
}