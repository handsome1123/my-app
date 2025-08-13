'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import Image from 'next/image';

interface ProductImage {
  id?: string;
  image_url: string;
  is_primary: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  status: 'active' | 'sold' | 'inactive';
  category_id: string;
  categoryName?: string;
  images: ProductImage[];
}

// Define the expected structure of the database response
interface ProductImageResponse {
  id: string;
  image_url: string;
  is_primary: boolean;
}

interface CategoryResponse {
  name: string;
}

interface ProductResponse {
  id: string;
  name: string;
  price: number;
  description: string;
  status: 'active' | 'sold' | 'inactive';
  category_id: string;
  category?: CategoryResponse[];  // Changed to array since Supabase returns array
  images?: ProductImageResponse[];
}

export default function EditProduct() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [images, setImages] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories
  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('id, name');
    if (error) {
      console.error('Failed to fetch categories', error);
    } else {
      setCategories(data || []);
    }
  };

  // Fetch product data - using useCallback to fix the dependency warning
  const fetchProduct = useCallback(async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        description,
        status,
        category_id,
        category:categories!inner(name),
        images:product_images(id, image_url, is_primary)
      `)
      .eq('id', productId)
      .single();

    if (error || !data) {
      setError('Failed to load product');
      setLoading(false);
      return;
    }

    // Type the response properly
    const typedData = data as ProductResponse;

    const transformed: Product = {
      id: typedData.id,
      name: typedData.name,
      price: typedData.price,
      description: typedData.description,
      status: typedData.status,
      category_id: typedData.category_id,
      categoryName: typedData.category?.[0]?.name,  // Access first element of array
      images: (typedData.images || []).map((img: ProductImageResponse) => {
        const url = img.image_url.startsWith('http')
          ? img.image_url
          : supabase.storage.from('product-images').getPublicUrl(img.image_url).data.publicUrl;
        return { ...img, image_url: url + `?t=${Date.now()}` };
      }),
    };

    setProduct(transformed);
    setLoading(false);
  }, [productId]);

  useEffect(() => {
    fetchCategories();
    fetchProduct();
  }, [fetchProduct]); // Now fetchProduct is included in the dependency array

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!product) return;

    // 1. Update product info
    const { error: updateError } = await supabase
      .from('products')
      .update({
        name: product.name,
        price: product.price,
        description: product.description,
        status: product.status,
        category_id: product.category_id,
      })
      .eq('id', product.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    // 2. Upload new images if any
    const uploadedImageUrls: string[] = [];
    if (images) {
      // Optional: delete old images if replacing
      // await supabase.from('product_images').delete().eq('product_id', product.id);

      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `product-images/${product.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (uploadError) {
          setError('Image upload failed: ' + uploadError.message);
          return;
        }

        const url = supabase.storage.from('product-images').getPublicUrl(filePath).data.publicUrl;
        uploadedImageUrls.push(url);
      }

      // 3. Insert new images into product_images table
      const imagesToInsert = uploadedImageUrls.map((url, index) => ({
        product_id: product.id,
        image_url: url,
        is_primary: product.images.length === 0 && index === 0, // first image primary if no previous
      }));

      const { error: imageInsertError } = await supabase.from('product_images').insert(imagesToInsert);
      if (imageInsertError) {
        setError('Failed to save images: ' + imageInsertError.message);
        return;
      }
    }

    alert('Product updated successfully');
    router.push('/seller/products');
  };

  const handlePrimaryChange = async (imageId: string) => {
    if (!product) return;

    // Reset all images to is_primary=false
    await supabase.from('product_images').update({ is_primary: false }).eq('product_id', product.id);
    // Set selected image to primary
    await supabase.from('product_images').update({ is_primary: true }).eq('id', imageId);

    fetchProduct(); // refresh images
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!product) return;
    await supabase.from('product_images').delete().eq('id', imageId);
    fetchProduct();
  };

  if (loading) return <p className="p-6">Loading product...</p>;

  if (!product) return <p className="p-6 text-red-500">Product not found</p>;

  return (
    <main className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>
      {error && <p className="mb-4 text-red-600">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold">Product Name</label>
          <input
            type="text"
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
            required
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Category</label>
          <select
            value={product.category_id}
            onChange={(e) => setProduct({ ...product, category_id: e.target.value })}
            required
            className="w-full border border-gray-300 p-2 rounded"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold">Price (THB)</label>
          <input
            type="number"
            value={product.price}
            onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
            required
            min={1}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Description</label>
          <textarea
            value={product.description}
            onChange={(e) => setProduct({ ...product, description: e.target.value })}
            rows={4}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Upload New Images</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setImages(e.target.files)}
            className="w-full bg-yellow-500 block"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          {product.images.map((img) => (
            <div key={img.id} className="relative">
              <Image 
                src={img.image_url} 
                alt="Product image" 
                width={100}
                height={80}
                className="w-full h-20 object-cover rounded"
                unoptimized={true} // Add this if using external URLs
              />
              <button
                type="button"
                onClick={() => handleDeleteImage(img.id!)}
                className="absolute top-0 right-0 text-red-600 bg-white rounded-full px-1"
              >
                ×
              </button>
              {!img.is_primary && (
                <button
                  type="button"
                  onClick={() => handlePrimaryChange(img.id!)}
                  className="absolute bottom-0 left-0 text-xs bg-blue-500 text-white px-1 rounded"
                >
                  Set Primary
                </button>
              )}
              {img.is_primary && (
                <span className="absolute bottom-0 left-0 text-xs bg-green-500 text-white px-1 rounded">
                  Primary
                </span>
              )}
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Update Product
        </button>
      </form>
    </main>
  );
}