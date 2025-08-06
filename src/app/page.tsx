// import { Header } from '@/components/layout/Header';
// import { Hero } from '@/components/home/Hero';
// import { FeaturedProducts } from '@/components/home/FeaturedProducts';
// import { Categories } from '@/components/home/Categories';
// import { Newsletter } from '@/components/home/Newsletter';
// import { Footer } from '@/components/layout/Footer';

// export default function Home() {
//   return (
//     <div className="min-h-screen bg-background">
//       <Header />
//       <main>
//         <Hero />
//         <Categories />
//         <FeaturedProducts />
//         <Newsletter />
//       </main>
//       <Footer />
//     </div>
//   );
// }

'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Product = {
  id: number;
  name: string;
  price: number;
};

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts(data as Product[]);
      }
    };

    fetchProducts();
  }, []);

  return (
    <main>
      <h1>Product List from Supabase</h1>
      <ul>
        {products.map((p) => (
          <li key={p.id}>
            {p.name} - ${p.price}
          </li>
        ))}
      </ul>
    </main>
  );
}


