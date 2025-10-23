<template>
  <div class="orders-page">
    <header class="orders-header">
      <h1>My Orders</h1>
      <button class="back-btn" @click="goBack">← Back to Shopping</button>
    </header>

    <div
      v-if="loading && ordersStore.orders.length === 0"
      class="loading-state"
    >
      <div class="spinner" />
      <p>Loading your orders...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p class="error-message">{{ error }}</p>
      <button @click="retry">Try Again</button>
    </div>

    <div v-else-if="ordersStore.orders.length === 0" class="empty-state">
      <div class="empty-icon">📦</div>
      <h2>No Orders Yet</h2>
      <p>You haven't placed any orders yet.</p>
      <button class="shop-now-btn" @click="goBack">Start Shopping</button>
    </div>

    <div v-else class="orders-list">
      <div
        v-for="order in ordersStore.orders"
        :key="order.id"
        class="order-card"
      >
        <div class="order-header">
          <div class="order-info">
            <h3>Order #{{ order.id }}</h3>
            <p class="order-date">{{ formatDate(order.created_at_utc) }}</p>
          </div>
          <div class="order-status">
            <span :class="['status-badge', getStatusClass(order.status)]">
              {{ order.status }}
            </span>
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
          <div class="order-total">
            <strong>Total Amount:</strong>
            <span class="total-amount">₹{{ order.total_amount.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="ordersStore.totalPages > 1" class="pagination">
        <button :disabled="ordersStore.page === 1" @click="prevPage">
          Previous
        </button>
        <span>Page {{ ordersStore.page }} of {{ ordersStore.totalPages }}</span>
        <button
          :disabled="ordersStore.page === ordersStore.totalPages"
          @click="nextPage"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { computed, defineComponent, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useOrdersStore } from '../../stores/orders'

  export default defineComponent({
    name: 'OrdersPage',
    setup () {
      const router = useRouter()
      const ordersStore = useOrdersStore()

      const loading = computed(() => ordersStore.loading)
      const error = computed(() => ordersStore.error)

      const fetchOrders = () => {
        ordersStore.fetchOrders(ordersStore.page)
      }

      const retry = () => {
        ordersStore.clearError()
        fetchOrders()
      }

      const goBack = () => {
        router.push('/dashboard')
      }

      const prevPage = () => {
        if (ordersStore.page > 1) {
          ordersStore.fetchOrders(ordersStore.page - 1)
        }
      }

      const nextPage = () => {
        if (ordersStore.page < ordersStore.totalPages) {
          ordersStore.fetchOrders(ordersStore.page + 1)
        }
      }

      const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      }

      const getStatusClass = (status: string) => {
        const statusLower = status.toLowerCase()
        if (statusLower.includes('pending')) return 'status-pending'
        if (statusLower.includes('processing')) return 'status-processing'
        if (statusLower.includes('shipped')) return 'status-shipped'
        if (statusLower.includes('delivered')) return 'status-delivered'
        if (statusLower.includes('cancelled')) return 'status-cancelled'
        return 'status-default'
      }

      onMounted(() => {
        fetchOrders()
      })

      return {
        ordersStore,
        loading,
        error,
        goBack,
        retry,
        prevPage,
        nextPage,
        formatDate,
        getStatusClass,
      }
    },
  })
</script>

<style scoped>
.orders-page {
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

.shop-now-btn {
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

.shop-now-btn:hover {
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

.order-status {
  display: flex;
  align-items: center;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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

.shipping-address {
  flex: 1;
  min-width: 250px;
}

.shipping-address strong {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
}

.shipping-address p {
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
  .orders-page {
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
}
</style>
