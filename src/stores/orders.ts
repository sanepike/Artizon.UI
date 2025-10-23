import { defineStore } from "pinia";
import { ref } from "vue";
import { ordersApi } from "../services/api";

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

export interface PlaceOrderData {
  items: Array<{ product_id: number; quantity: number }>;
  shipping_address: string;
}

export const useOrdersStore = defineStore("orders", () => {
  const orders = ref<Order[]>([]);
  const currentOrder = ref<Order | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const page = ref(1);
  const totalPages = ref(1);
  const total = ref(0);

  const fetchOrders = async (pageNum = 1, limit = 10) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await ordersApi.getMyOrders(pageNum, limit);
      orders.value = response.orders;
      page.value = response.page;
      totalPages.value = response.total_pages;
      total.value = response.total;
    } catch (error_: any) {
      error.value = error_.response?.data?.error || "Failed to fetch orders";
      console.error("Error fetching orders:", error_);
    } finally {
      loading.value = false;
    }
  };

  const fetchOrderById = async (orderId: number) => {
    loading.value = true;
    error.value = null;
    try {
      currentOrder.value = await ordersApi.getOrder(orderId);
    } catch (error_: any) {
      error.value =
        error_.response?.data?.error || "Failed to fetch order details";
      console.error("Error fetching order:", error_);
    } finally {
      loading.value = false;
    }
  };

  const placeOrder = async (orderData: PlaceOrderData) => {
    loading.value = true;
    error.value = null;
    try {
      const newOrder = await ordersApi.placeOrder(orderData);
      // Add the new order to the beginning of the list
      orders.value.unshift(newOrder);
      total.value++;
      return newOrder;
    } catch (error_: any) {
      error.value = error_.response?.data?.error || "Failed to place order";
      console.error("Error placing order:", error_);
      throw error_;
    } finally {
      loading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  const reset = () => {
    orders.value = [];
    currentOrder.value = null;
    loading.value = false;
    error.value = null;
    page.value = 1;
    totalPages.value = 1;
    total.value = 0;
  };

  return {
    orders,
    currentOrder,
    loading,
    error,
    page,
    totalPages,
    total,
    fetchOrders,
    fetchOrderById,
    placeOrder,
    clearError,
    reset,
  };
});
