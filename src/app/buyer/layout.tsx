// app/buyer/layout.tsx
export default function BuyerLayout({ children }: { children: React.ReactNode }) {
    return (
      <div className="flex">
        <aside className="w-64 bg-gray-100 p-4">Buyer Menu</aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    );
  }
  