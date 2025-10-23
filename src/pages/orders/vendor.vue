<template>
  <div class="vendor-orders-page">
    <header class="orders-header">
      <h1>Customer Orders</h1>
      <button class="back-btn" @click="goBack">← Back to Dashboard</button>
    </header>

    <div v-if="loading && orders.length === 0" class="loading-state">
      <div class="spinner" />
      <p>Loading orders...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p class="error-message">{{ error }}</p>
      <button @click="retry">Try Again</button>
    </div>

    <div v-else-if="orders.length === 0" class="empty-state">
      <div class="empty-icon">📦</div>
      <h2>No Orders Yet</h2>
      <p>You haven't received any orders for your products yet.</p>
      <button class="dashboard-btn" @click="goBack">Go to Dashboard</button>
    </div>

    <div v-else class="orders-list">
      <div v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-header">
          <div class="order-info">
            <h3>Order #{{ order.id }}</h3>
            <p class="order-date">{{ formatDate(order.created_at_utc) }}</p>
          </div>
          <div class="order-status-section">
            <span :class="['status-badge', getStatusClass(order.status)]">
              {{ order.status }}
            </span>
            <button class="update-status-btn" @click="openStatusModal(order)">
              Update Status
            </button>
          </div>
        </div>

        <div class="order-items">
          <div v-for="item in order.items" :key="item.id" class="order-item">
            <div class="item-details">
              <h4>{{ item.product_name }}</h4>
              <p class="item-meta">
                Quantity: {{ item.quantity }} × ₹{{
                  item.product_price.toFixed(2)
                }}
              </p>
            </div>
            <div class="item-total">₹{{ item.total_price.toFixed(2) }}</div>
          </div>
        </div>

        <div class="order-footer">
          <div class="shipping-address">
            <strong>Shipping Address:</strong>
            <p>{{ order.shipping_address }}</p>
          </div>
          <div class="customer-info">
            <strong>Customer ID:</strong>
            <p>#{{ order.customer_id }}</p>
          </div>
          <div class="order-total">
            <strong>Total Amount:</strong>
            <span class="total-amount"
              >₹{{ order.total_amount.toFixed(2) }}</span
            >
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button :disabled="page === 1" @click="prevPage">Previous</button>
        <span>Page {{ page }} of {{ totalPages }}</span>
        <button :disabled="page === totalPages" @click="nextPage">Next</button>
      </div>
    </div>

    <!-- Status Update Modal -->
    <div v-if="showStatusModal" class="modal-overlay" @click="closeStatusModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Update Order Status</h2>
          <button class="close-btn" @click="closeStatusModal">×</button>
        </div>
        <div class="modal-body">
          <p class="order-id-text">Order #{{ selectedOrder?.id }}</p>
          <div class="status-options">
            <button
              v-for="status in availableStatuses"
              :key="status.value"
              :class="[
                'status-option',
                { selected: selectedStatus === status.value },
              ]"
              @click="selectedStatus = status.value"
            >
              <span :class="['status-icon', getStatusClass(status.value)]"
                >●</span
              >
              <div class="status-info">
                <strong>{{ status.label }}</strong>
                <p>{{ status.description }}</p>
              </div>
            </button>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="closeStatusModal">Cancel</button>
          <button
            class="confirm-btn"
            :disabled="updatingStatus || !selectedStatus"
            @click="updateStatus"
          >
            {{ updatingStatus ? "Updating..." : "Update Status" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { ordersApi } from "../../services/api";

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  quantity: number;
  total_price: number;
}

interface Order {
  id: number;
  customer_id: number;
  items: OrderItem[];
  total_amount: number;
  shipping_address: string;
  status: string;
  created_at_utc: string;
}

export default defineComponent({
  name: "VendorOrdersPage",
  setup() {
    const router = useRouter();
    const orders = ref<Order[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const page = ref(1);
    const totalPages = ref(1);
    const showStatusModal = ref(false);
    const selectedOrder = ref<Order | null>(null);
    const selectedStatus = ref("");
    const updatingStatus = ref(false);

    const availableStatuses = [
      {
        value: "PLACED",
        label: "Placed",
        description: "Order has been placed and is awaiting processing",
      },
      {
        value: "SHIPPED",
        label: "Shipped",
        description: "Order has been shipped and is on the way",
      },
      {
        value: "DELIVERED",
        label: "Delivered",
        description: "Order has been delivered to the customer",
      },
      {
        value: "CANCELLED",
        label: "Cancelled",
        description: "Order has been cancelled",
      },
    ];

    const fetchOrders = async () => {
      loading.value = true;
      error.value = null;
      try {
        const response = await ordersApi.getVendorOrders(page.value, 10);
        orders.value = response.orders || [];
        page.value = response.page || 1;
        totalPages.value = response.total_pages || 1;
      } catch (error_: any) {
        error.value = error_.message || "Failed to fetch orders";
        console.error("Error fetching vendor orders:", error_);
      } finally {
        loading.value = false;
      }
    };

    const retry = () => {
      error.value = null;
      fetchOrders();
    };

    const goBack = () => {
      router.push("/dashboard");
    };

    const prevPage = () => {
      if (page.value > 1) {
        page.value--;
        fetchOrders();
      }
    };

    const nextPage = () => {
      if (page.value < totalPages.value) {
        page.value++;
        fetchOrders();
      }
    };

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const getStatusClass = (status: string) => {
      const statusLower = status.toLowerCase();
      if (statusLower.includes("pending") || statusLower.includes("placed"))
        return "status-pending";
      if (statusLower.includes("processing")) return "status-processing";
      if (statusLower.includes("shipped")) return "status-shipped";
      if (statusLower.includes("delivered")) return "status-delivered";
      if (statusLower.includes("cancelled")) return "status-cancelled";
      return "status-default";
    };

    const openStatusModal = (order: Order) => {
      selectedOrder.value = order;
      selectedStatus.value = order.status;
      showStatusModal.value = true;
    };

    const closeStatusModal = () => {
      showStatusModal.value = false;
      selectedOrder.value = null;
      selectedStatus.value = "";
    };

    const updateStatus = async () => {
      if (!selectedOrder.value || !selectedStatus.value) return;

      updatingStatus.value = true;
      try {
        await ordersApi.updateOrderStatus(
          selectedOrder.value.id,
          selectedStatus.value
        );

        // Update the order in the list
        const orderIndex = orders.value.findIndex(
          (o) => o.id === selectedOrder.value?.id
        );
        if (orderIndex !== -1) {
          orders.value[orderIndex].status = selectedStatus.value;
        }

        closeStatusModal();
        alert("Order status updated successfully!");
      } catch (error_: any) {
        alert(
          error_.message || "Failed to update order status. Please try again."
        );
        console.error("Error updating order status:", error_);
      } finally {
        updatingStatus.value = false;
      }
    };

    onMounted(() => {
      fetchOrders();
    });

    return {
      orders,
      loading,
      error,
      page,
      totalPages,
      showStatusModal,
      selectedOrder,
      selectedStatus,
      updatingStatus,
      availableStatuses,
      goBack,
      retry,
      prevPage,
      nextPage,
      formatDate,
      getStatusClass,
      openStatusModal,
      closeStatusModal,
      updateStatus,
    };
  },
});
</script>

<style scoped>
.vendor-orders-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.orders-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.orders-header h1 {
  margin: 0;
  color: #333;
}

.back-btn {
  background: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #e8e8e8;
  border-color: #ccc;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #666;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-state p {
  color: #666;
  font-size: 1.1rem;
}

/* Error State */
.error-state {
  text-align: center;
  padding: 3rem;
  background: #fff3f3;
  border: 1px solid #ffcccb;
  border-radius: 8px;
}

.error-message {
  color: #d32f2f;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.error-state button {
  background: #d32f2f;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.error-state button:hover {
  background: #b71c1c;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
}

.empty-state h2 {
  color: #333;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.dashboard-btn {
  background: #4caf50;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: background 0.2s;
}

.dashboard-btn:hover {
  background: #45a049;
}

/* Orders List */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.order-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.order-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.order-info h3 {
  margin: 0 0 0.25rem 0;
  color: #333;
  font-size: 1.2rem;
}

.order-date {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.order-status-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.update-status-btn {
  background: #2196f3;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.85rem;
  transition: background 0.2s;
  white-space: nowrap;
}

.update-status-btn:hover {
  background: #1976d2;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-processing {
  background: #cfe2ff;
  color: #084298;
}

.status-shipped {
  background: #d1ecf1;
  color: #0c5460;
}

.status-delivered {
  background: #d4edda;
  color: #155724;
}

.status-cancelled {
  background: #f8d7da;
  color: #721c24;
}

.status-default {
  background: #e7e7e7;
  color: #333;
}

.order-items {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.item-details h4 {
  margin: 0 0 0.25rem 0;
  color: #333;
  font-size: 1rem;
}

.item-meta {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.item-total {
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
}

.order-footer {
  padding: 1.5rem;
  background: #f8f9fa;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.shipping-address,
.customer-info {
  flex: 1;
  min-width: 200px;
}

.shipping-address strong,
.customer-info strong {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
}

.shipping-address p,
.customer-info p {
  margin: 0;
  color: #666;
  line-height: 1.5;
}

.order-total {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.order-total strong {
  color: #333;
}

.total-amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: #4caf50;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 2rem 0;
}

.pagination button {
  background: #b0b0b0;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.pagination button:hover:not(:disabled) {
  background: #888;
}

.pagination button:disabled {
  background: #ddd;
  cursor: not-allowed;
}

.pagination span {
  font-weight: 500;
  color: #333;
}

/* Responsive */
@media (max-width: 768px) {
  .vendor-orders-page {
    padding: 1rem;
  }

  .orders-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .order-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .order-total {
    width: 100%;
    align-items: flex-start;
  }

  .item-total {
    font-size: 1rem;
  }

  .total-amount {
    font-size: 1.3rem;
  }

  .order-status-section {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
  }

  .update-status-btn {
    width: 100%;
  }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.25rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: #999;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s;
  line-height: 1;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #666;
}

.modal-body {
  padding: 1.5rem;
}

.order-id-text {
  font-weight: 600;
  color: #666;
  margin: 0 0 1.5rem 0;
  font-size: 1rem;
}

.status-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.status-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.status-option:hover {
  border-color: #2196f3;
  background: #f5f9ff;
}

.status-option.selected {
  border-color: #2196f3;
  background: #e3f2fd;
}

.status-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.status-info {
  flex: 1;
}

.status-info strong {
  display: block;
  color: #333;
  margin-bottom: 0.25rem;
  font-size: 1rem;
}

.status-info p {
  margin: 0;
  color: #666;
  font-size: 0.85rem;
  line-height: 1.4;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #eee;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: background 0.2s;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.cancel-btn:hover {
  background: #e8e8e8;
}

.confirm-btn {
  background: #2196f3;
  color: white;
}

.confirm-btn:hover:not(:disabled) {
  background: #1976d2;
}

.confirm-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

@media (max-width: 480px) {
  .modal-footer {
    flex-direction: column;
  }
}
</style>
