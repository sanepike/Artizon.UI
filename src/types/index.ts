// Shared TypeScript interfaces for the application

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  images: Array<{ is_primary: boolean; url: string }>;
  vendor_id: number;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  quantity: number;
  total_price: number;
}

export interface Order {
  id: number;
  customer_id: number;
  items: OrderItem[];
  total_amount: number;
  shipping_address: string;
  status: string;
  created_at_utc: string;
}
