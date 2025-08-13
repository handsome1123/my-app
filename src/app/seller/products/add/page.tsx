'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';


export default function AddProduct() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [images, setImages] = useState<FileList | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch categories from Supabase
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('categories').select('id, name');
      if (error) {
        setError('Failed to load categories');
      } else {
        setCategories(data || []);
        if (data && data.length > 0) setCategoryId(data[0].id); // select first by default
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter a product name');
      return;
    }
    if (!price || price <= 0) {
      setError('Please enter a valid price');
      return;
    }
    if (!categoryId) {
      setError('Please select a category');
      return;
    }

    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;

    if (!userId) {
      setError('User not authenticated');
      return;
    }

    // 1. Insert product
    const { data: productData, error: productError } = await supabase.from('products').insert([
      {
        name,
        price,
        description,
        category_id: categoryId,
        seller_id: userId,
        status: 'active',
      },
    ])
    .select('id')
    .single();

  if (productError || !productData) {
    setError(productError?.message || 'Failed to add product');
    return;
  }

  const productId = productData.id;

    // 2. Upload images to Supabase Storage
  // (Optional: create a folder like 'product-images/<productId>/')
  // Here is a simple example; you may want to handle naming and errors better
  const uploadedImageUrls: string[] = [];

  if (images) {
    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `product-images/${productId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images') // your bucket name
        .upload(filePath, file);

      if (uploadError) {
        setError('Image upload failed: ' + uploadError.message);
        return;
      }

      // Build public URL (if your bucket is public)
      const url = supabase.storage.from('product-images').getPublicUrl(filePath).data.publicUrl;
      uploadedImageUrls.push(url);
    }
  }

    // 3. Insert image records to product_images table
  const imagesToInsert = uploadedImageUrls.map((url, index) => ({
    product_id: productId,
    image_url: url,
    is_primary: index === 0, // first image is primary
  }));

  const { error: imageInsertError } = await supabase
    .from('product_images')
    .insert(imagesToInsert);

  if (imageInsertError) {
    setError('Failed to save product images: ' + imageInsertError.message);
    return;
  }

  alert(`Product "${name}" added successfully.`);
  router.push('/seller/products');
};


  return (
    <main className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add New Product</h1>

      {error && <p className="mb-4 text-red-600">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold">Product Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Category</label>
          <select
            value={categoryId || ''}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="w-full border border-gray-300 p-2 rounded"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold">Price (THB)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            required
            min={1}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>
        <div>
  <label className="block mb-1 font-semibold">Product Images</label>
  <input
    type="file"
    accept="image/*"
    multiple
    onChange={(e) => setImages(e.target.files)}
    className="w-full bg-yellow-500 block"
  />
</div>
        <div>
          <label className="block mb-1 font-semibold">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Add Product
        </button>
      </form>
    </main>
  );
}
