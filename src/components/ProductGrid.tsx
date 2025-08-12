import ProductCard from "./ProductCard";

// Define the Product type (adjust fields as needed)
interface Product {
  id: string | number;
  name: string;
  price: number;
  images?: { image_url: string; is_primary: boolean }[];
  // add other fields as necessary
}

export default function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

