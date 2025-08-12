'use client';

import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/layout/Footer';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ProductFilters } from '@/components/products/ProductFilters';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

// Mock sellers for filter
const sellers = [
  { id: 'seller1', name: 'Alice' },
  { id: 'seller2', name: 'Bob' },
  { id: 'seller3', name: 'Charlie' },
];

// Import allProducts from ProductGrid for filtering
import { allProducts } from '@/components/products/ProductGrid';

export default function ProductsPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [search, setSearch] = useState('');

  // For demo, assign sellers to products
  const productsWithSellers = useMemo(() =>
    allProducts.map((p, i) => ({ ...p, seller: sellers[i % sellers.length] })),
    []
  );

  const filteredProducts = useMemo(() => {
    return productsWithSellers.filter(product => {
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
      const matchesBrand = selectedBrands.length === 0; // No brand filtering for now
      const matchesSeller = !selectedSeller || (product.seller && product.seller.id === selectedSeller);
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesSearch = search === '' || product.name.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesBrand && matchesSeller && matchesPrice && matchesSearch;
    });
  }, [productsWithSellers, selectedCategories, selectedBrands, selectedSeller, priceRange, search]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">All Products</h1>
          <p className="text-muted-foreground">Discover our amazing collection</p>
        </div>
        
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedSeller}
            onChange={(e) => setSelectedSeller(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="">All Sellers</option>
            {sellers.map(seller => (
              <option key={seller.id} value={seller.id}>{seller.name}</option>
            ))}
          </select>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <ProductFilters
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              selectedBrands={selectedBrands}
              setSelectedBrands={setSelectedBrands}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
            />
          </aside>
          
          <div className="flex-1">
            <ProductGrid products={filteredProducts} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
