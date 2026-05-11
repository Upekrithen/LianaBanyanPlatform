// types/product.types.ts

export interface Product {
  id: string;
  name: string;
  description: string;
  priceCredits: number;
  category: string;
  stock: number;
  sellerId: string;
  active: boolean;
}

export interface CreateProductDto {
  name: string;
  description: string;
  priceCredits: number;
  category: string;
  stock: number;
  sellerId: string;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  priceCredits?: number;
  stock?: number;
  active?: boolean;
}

export type ProductId = string;

export interface OrderLine {
  productId: ProductId;
  quantity: number;
  unitPriceCredits: number;
}

export interface Order {
  id: string;
  buyerId: string;
  lines: OrderLine[];
  totalCredits: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
}

export interface CreateOrderDto {
  buyerId: string;
  lines: Array<{ productId: ProductId; quantity: number }>;
}
