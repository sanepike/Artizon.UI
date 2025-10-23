<template>
  <div class="customer-dashboard">
    <header class="dashboard-header">
      <h1>Browse Marketplace</h1>
      <button class="orders-btn" @click="goToOrders">📦 My Orders</button>
    </header>

    <div class="dashboard-layout">
      <!-- Left side: Product List -->
      <section class="products-section">
        <div class="search-bar">
          <input v-model="search" placeholder="Search products..." />
        </div>

        <div v-if="loading" class="loading-state">
          <p>Loading products...</p>
        </div>

        <div v-else-if="filteredProducts.length > 0" class="products-list">
          <ProductCard
            v-for="product in filteredProducts"
            :key="product.id"
            :description="product.description"
            :image-url="product.images?.[0]?.url"
            :name="product.name"
            :price="product.price"
            @add-to-cart="addToCart(product)"
          />
        </div>

        <div v-else class="empty-state">
          <p>No products found.</p>
        </div>

        <div v-if="totalPages > 1" class="pagination">
          <button :disabled="page === 1" @click="prevPage">Previous</button>
          <span>Page {{ page }} of {{ totalPages }}</span>
          <button :disabled="page === totalPages" @click="nextPage">
            Next
          </button>
        </div>
      </section>

      <!-- Right side: Collapsible Cart Panel -->
      <aside :class="['cart-panel', { collapsed: isCartCollapsed }]">
        <div class="cart-header" @click="toggleCart">
          <h2>
            Shopping Cart
            <span v-if="cart.itemCount > 0" class="cart-badge">
              {{ cart.itemCount }}
            </span>
          </h2>
          <button class="collapse-btn">
            {{ isCartCollapsed ? "◀" : "▶" }}
          </button>
        </div>

        <div v-if="!isCartCollapsed" class="cart-content">
          <div v-if="cart.items.length > 0" class="cart-items">
            <div v-for="item in cart.items" :key="item.id" class="cart-item">
              <img
                :alt="item.name"
                class="cart-item-image"
                :src="item.image_urls?.[0] || '/placeholder.png'"
              />
              <div class="cart-item-details">
                <h4>{{ item.name }}</h4>
                <p class="cart-item-price">₹{{ item.price.toFixed(2) }}</p>
                <div class="quantity-controls">
                  <button @click="decreaseQuantity(item.id)">-</button>
                  <span>{{ item.quantity }}</span>
                  <button @click="increaseQuantity(item.id)">+</button>
                </div>
              </div>
              <button class="remove-btn" @click="removeFromCart(item.id)">
                ✕
              </button>
            </div>

            <div class="cart-summary">
              <div class="cart-total">
                <strong>Total:</strong>
                <strong>₹{{ cart.total.toFixed(2) }}</strong>
              </div>
              <button class="checkout-btn" @click="goToCheckout">
                Proceed to Checkout
              </button>
            </div>
          </div>

          <div v-else class="empty-cart">
            <p>Your cart is empty</p>
            <p class="empty-cart-hint">Add some products to get started!</p>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script lang="ts">
import type { Product } from "../../types";

import { computed, defineComponent, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import ProductCard from "../../components/ProductCard.vue";
import { productsApi } from "../../services/api";
import { useAuthStore } from "../../stores/auth";
import { useCartStore } from "../../stores/cart";

export default defineComponent({
  name: "CustomerDashboard",
  components: {
    ProductCard,
  },
  setup() {
    const router = useRouter();
    const auth = useAuthStore();
    const cartStore = useCartStore();

    const products = ref<Product[]>([]);
    const search = ref("");
    const page = ref(1);
    const totalPages = ref(1);
    const loading = ref(false);
    const isCartCollapsed = ref(false);

    const user = computed(() => auth.user);
    const cart = computed(() => cartStore);

    const filteredProducts = computed(() => {
      if (!search.value) return products.value;
      const searchLower = search.value.toLowerCase();
      return products.value.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
      );
    });

    const fetchProducts = async () => {
      loading.value = true;
      try {
        const response = await productsApi.getProducts(page.value, 10);
        products.value = response.products;
        totalPages.value = response.total_pages;
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        loading.value = false;
      }
    };

    const addToCart = (product: Product) => {
      const imageUrl = product.images?.[0]?.url || "/placeholder.png";
      cartStore.add({
        id: product.id,
        name: product.name,
        price: product.price,
        image_urls: [imageUrl],
      });
    };

    const removeFromCart = (productId: number) => {
      cartStore.remove(productId);
    };

    const increaseQuantity = (productId: number) => {
      const item = cartStore.items.find((item) => item.id === productId);
      if (item) {
        cartStore.updateQuantity(productId, item.quantity + 1);
      }
    };

    const decreaseQuantity = (productId: number) => {
      const item = cartStore.items.find((item) => item.id === productId);
      if (item && item.quantity > 1) {
        cartStore.updateQuantity(productId, item.quantity - 1);
      }
    };

    const toggleCart = () => {
      isCartCollapsed.value = !isCartCollapsed.value;
    };

    const goToCheckout = () => {
      router.push("/cart");
    };

    const goToOrders = () => {
      router.push("/orders/customer");
    };

    const prevPage = () => {
      if (page.value > 1) {
        page.value--;
        fetchProducts();
      }
    };

    const nextPage = () => {
      if (page.value < totalPages.value) {
        page.value++;
        fetchProducts();
      }
    };

    onMounted(fetchProducts);

    return {
      products,
      search,
      page,
      totalPages,
      loading,
      isCartCollapsed,
      user,
      cart,
      filteredProducts,
      addToCart,
      removeFromCart,
      increaseQuantity,
      decreaseQuantity,
      toggleCart,
      goToCheckout,
      goToOrders,
      prevPage,
      nextPage,
    };
  },
});
</script>

<style scoped>
.customer-dashboard {
  width: 100%;
  height: 100%;
}

.dashboard-header {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.orders-btn {
  background: #4caf50;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.orders-btn:hover {
  background: #45a049;
}

.dashboard-layout {
  display: flex;
  gap: 1rem;
  height: calc(100vh - 150px);
}

/* Left side - Products Section */
.products-section {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-bar {
  margin-bottom: 1rem;
}

.search-bar input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.search-bar input:focus {
  outline: none;
  border-color: #999;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.products-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-right: 0.5rem;
}

.products-list::-webkit-scrollbar {
  width: 8px;
}

.products-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.products-list::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

.products-list::-webkit-scrollbar-thumb:hover {
  background: #999;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0 0 0;
  margin-top: 1rem;
  border-top: 1px solid #eee;
}

.pagination button {
  background: #b0b0b0;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.pagination button:hover:not(:disabled) {
  background: #888;
}

.pagination button:disabled {
  background: #ddd;
  cursor: not-allowed;
}

/* Right side - Cart Panel */
.cart-panel {
  width: 350px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  overflow: hidden;
}

.cart-panel.collapsed {
  width: 60px;
}

.cart-header {
  background: #f8f9fa;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
  border-bottom: 1px solid #eee;
}

.cart-panel.collapsed .cart-header {
  flex-direction: column;
  padding: 1rem 0.5rem;
}

.cart-header h2 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cart-panel.collapsed .cart-header h2 {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  font-size: 0.9rem;
}

.cart-badge {
  background: #ff6b6b;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: bold;
}

.collapse-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #666;
  padding: 0.25rem;
}

.cart-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.cart-items {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 1rem;
}

.cart-items::-webkit-scrollbar {
  width: 6px;
}

.cart-items::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.cart-items::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.cart-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid #eee;
  border-radius: 6px;
  margin-bottom: 0.75rem;
  background: #fafafa;
  position: relative;
}

.cart-item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  background: #e0e0e0;
  flex-shrink: 0;
}

.cart-item-details {
  flex: 1;
  min-width: 0;
}

.cart-item-details h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cart-item-price {
  color: #666;
  font-size: 0.85rem;
  margin: 0.25rem 0;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.quantity-controls button {
  width: 24px;
  height: 24px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.quantity-controls button:hover {
  background: #f5f5f5;
}

.quantity-controls span {
  min-width: 24px;
  text-align: center;
  font-weight: 500;
}

.remove-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: #ff6b6b;
  color: white;
  border: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.remove-btn:hover {
  background: #ff5252;
}

.cart-summary {
  border-top: 2px solid #eee;
  padding: 1rem;
  background: #f8f9fa;
}

.cart-total {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.checkout-btn {
  width: 100%;
  background: #4caf50;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.checkout-btn:hover {
  background: #45a049;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  text-align: center;
  color: #999;
  height: 100%;
}

.empty-cart p {
  margin: 0.5rem 0;
}

.empty-cart-hint {
  font-size: 0.85rem;
  color: #bbb;
}

@media (max-width: 1024px) {
  .dashboard-layout {
    flex-direction: column;
    height: auto;
  }

  .cart-panel {
    width: 100%;
    max-height: 400px;
  }

  .cart-panel.collapsed {
    width: 100%;
    max-height: 60px;
  }

  .products-section {
    max-height: 600px;
  }
}

@media (max-width: 768px) {
  .dashboard-header h1 {
    font-size: 1.5rem;
  }
}
</style>
