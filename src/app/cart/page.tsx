import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartContent } from '@/components/cart/CartContent';

export default function CartPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Shopping Cart</h1>
          <p className="text-muted-foreground">Review your items before checkout</p>
        </div>
        <CartContent />
      </main>
      <Footer />
    </div>
  );
}