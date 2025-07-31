export type Product = {
  id: number;
  name: string;
  price: number;
  owner: string; // seller email or name
};

export const mockProducts: Product[] = [
  { id: 1, name: 'Wireless Mouse', price: 25, owner: 'seller1' },
  { id: 2, name: 'Laptop Stand', price: 45, owner: 'seller2' },
  { id: 3, name: 'Used iPhone 12', price: 450, owner: 'seller1' },
  { id: 4, name: 'Desk Lamp', price: 18, owner: 'seller3' },
];
