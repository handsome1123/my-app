import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { verifyToken } from "@/lib/jwt";
import cloudinary from "@/lib/cloudinary";

interface DecodedToken {
  id: string;
  role: string;
}

interface CloudinaryUploadResult {
  secure_url: string;
  [key: string]: unknown;
}

// ---------------- GET PRODUCT BY ID ----------------
export async function GET(
  req: Request, 
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    // ✅ Await params in Next.js 15
    const { id } = await context.params;

    const product = await Product.findById(id).populate(
      "sellerId",
      "name email"
    );

    if (!product)
      return NextResponse.json({ error: "Product not found" }, { status: 404 });

    return NextResponse.json({ success: true, product }, { status: 200 });
  } catch (error: unknown) {
    console.error("GET /api/products/[id] error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Server error" },
      { status: 500 }
    );
  }
}

// ---------------- UPDATE PRODUCT ----------------
export async function PUT(
  req: Request, 
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    // ✅ Await params in Next.js 15
    const { id } = await context.params;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer "))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token) as DecodedToken | null;
    if (!decoded)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const product = await Product.findById(id);
    if (!product)
      return NextResponse.json({ error: "Product not found" }, { status: 404 });

    // Only allow owner or admin
    if (decoded.role !== "admin" && product.sellerId.toString() !== decoded.id) {
      return NextResponse.json(
        { error: "Not authorized to edit this product" },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = Number(formData.get("price"));
    const stock = Number(formData.get("stock") || 0);
    const category = formData.get("category") as string;
    const isActive = formData.get("isActive") === "true";
    const imageFile = formData.get("image") as File | null;

    // Update product fields
    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (!isNaN(price)) product.price = price;
    if (!isNaN(stock)) product.stock = stock;
    if (category !== undefined) product.category = category;
    if (isActive !== undefined) product.isActive = isActive;

    // Handle image upload if provided
    if (imageFile && imageFile.size > 0) {
      try {
        const buffer = Buffer.from(await imageFile.arrayBuffer());

        const uploadRes = await new Promise<CloudinaryUploadResult>(
          (resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { 
                folder: "products",
                transformation: [
                  { width: 800, height: 800, crop: "limit" },
                  { quality: "auto" },
                  { fetch_format: "auto" }
                ]
              },
              (err: unknown, result: unknown) => {
                if (err) reject(err);
                else resolve(result as CloudinaryUploadResult);
              }
            );
            stream.end(buffer);
          }
        );

        product.imageUrl = uploadRes.secure_url;
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        return NextResponse.json(
          { error: "Failed to upload image" },
          { status: 500 }
        );
      }
    }

    // Save updated product
    await product.save();

    // Return updated product with populated seller info
    const updatedProduct = await Product.findById(id).populate(
      "sellerId",
      "name email"
    );

    return NextResponse.json(
      { success: true, product: updatedProduct },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("PUT /api/products/[id] error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Server error" },
      { status: 500 }
    );
  }
}

// ---------------- DELETE PRODUCT ----------------
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    // ✅ Await params in Next.js 15
    const { id } = await context.params;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer "))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token) as DecodedToken | null;
    if (!decoded)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const product = await Product.findById(id);
    if (!product)
      return NextResponse.json({ error: "Product not found" }, { status: 404 });

    // Only allow owner or admin to delete
    if (decoded.role !== "admin" && product.sellerId.toString() !== decoded.id) {
      return NextResponse.json(
        { error: "Not authorized to delete this product" },
        { status: 403 }
      );
    }

    // Optional: Delete image from Cloudinary
    if (product.imageUrl) {
      try {
        // Extract public_id from Cloudinary URL
        const urlParts = product.imageUrl.split('/');
        const fileWithExtension = urlParts[urlParts.length - 1];
        const publicId = `products/${fileWithExtension.split('.')[0]}`;
        
        await cloudinary.uploader.destroy(publicId);
      } catch (deleteImageError) {
        console.error("Failed to delete image from Cloudinary:", deleteImageError);
        // Continue with product deletion even if image deletion fails
      }
    }

    // Delete the product
    await Product.findByIdAndDelete(id);

    return NextResponse.json(
      { success: true, message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("DELETE /api/products/[id] error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Server error" },
      { status: 500 }
    );
  }
}
