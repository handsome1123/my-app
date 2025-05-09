import { useEffect, useState } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  category: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export function useProduct(id: string | string[] | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const numericId = Number(Array.isArray(id) ? id[0] : id);

    if (isNaN(numericId)) {
      setError('Invalid product ID');
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${numericId}`);
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        setProduct(data.product);
      } catch (err) {
        setError((err as Error).message);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  return { product, loading, error };
}
