<template>
  <div class="cart-page">
    <header class="cart-header">
      <h1>Shopping Cart</h1>
      <p v-if="cartItems.length > 0" class="items-count">
        {{ cartItems.length }} item(s) in cart
      </p>
    </header>

    <div v-if="cartItems.length === 0" class="empty-cart">
      <h2>Your cart is empty</h2>
      <p>Add some products to your cart to get started!</p>
      <router-link class="continue-shopping" to="/">
        Continue Shopping
      </router-link>
    </div>

    <template v-else>
      <div class="cart-content">
        <div class="cart-items">
          <div v-for="item in cartItems" :key="item.id" class="cart-item">
            <div class="item-image">
              <img :alt="item.name" :src="item.image_urls[0]">
            </div>
            <div class="item-details">
              <h3>{{ item.name }}</h3>
              <p class="item-price">₹{{ item.price.toFixed(2) }}</p>
              <div class="quantity-controls">
                <button
                  class="quantity-btn"
                  :disabled="item.quantity <= 1"
                  @click="decreaseQuantity(item)"
                >
                  -
                </button>
                <span class="quantity">{{ item.quantity }}</span>
                <button class="quantity-btn" @click="increaseQuantity(item)">
                  +
                </button>
              </div>
              <button class="remove-btn" @click="removeItem(item)">
                Remove
              </button>
            </div>
            <div class="item-total">
              ₹{{ (item.price * item.quantity).toFixed(2) }}
            </div>
          </div>
        </div>

        <div class="cart-summary">
          <h2>Order Summary</h2>
          <div class="summary-details">
            <div class="summary-row">
              <span>Subtotal</span>
              <span>₹{{ subtotal.toFixed(2) }}</span>
            </div>
            <div class="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div class="summary-row total">
              <span>Total</span>
              <span>₹{{ subtotal.toFixed(2) }}</span>
            </div>
          </div>

          <div class="checkout-section">
            <button
              class="checkout-btn"
              :disabled="loading"
              @click="showCheckoutModal = true"
            >
              {{ loading ? "Processing..." : "Proceed to Checkout" }}
            </button>
            <router-link class="continue-shopping-link" to="/">
              Continue Shopping
            </router-link>
          </div>
        </div>
      </div>
    </template>

    <!-- Checkout Modal -->
    <Modal v-model="showCheckoutModal" title="Complete Your Order">
      <form class="checkout-form" @submit.prevent="placeOrder">
        <div class="form-group">
          <label for="shippingAddress">Shipping Address</label>
          <textarea
            id="shippingAddress"
            v-model="shippingAddress"
            :class="{ error: addressError }"
            required
            rows="4"
          />
          <span v-if="addressError" class="error-text">{{ addressError }}</span>
        </div>

        <div class="order-items">
          <h3>Order Items</h3>
          <div v-for="item in cartItems" :key="item.id" class="order-item">
            <span>{{ item.name }} × {{ item.quantity }}</span>
            <span>₹{{ (item.price * item.quantity).toFixed(2) }}</span>
          </div>
          <div class="order-total">
            <strong>Total:</strong>
            <strong>₹{{ subtotal.toFixed(2) }}</strong>
          </div>
        </div>

        <div class="form-actions">
          <button
            class="cancel-btn"
            type="button"
            @click="showCheckoutModal = false"
          >
            Cancel
          </button>
          <button class="submit-btn" :disabled="loading" type="submit">
            {{ loading ? "Placing Order..." : "Place Order" }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script lang="ts">
  import { computed, defineComponent, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import Modal from '../../components/Modal.vue'
  import { useCartStore } from '../../stores/cart'
  import { useOrdersStore } from '../../stores/orders'

  export default defineComponent({
    name: 'CartPage',
    components: {
      Modal,
    },
    setup () {
      const router = useRouter()
      const cart = useCartStore()
      const ordersStore = useOrdersStore()
      const loading = ref(false)
      const showCheckoutModal = ref(false)
      const shippingAddress = ref('')
      const addressError = ref('')

      const cartItems = computed(() => cart.items)
      const subtotal = computed(() => {
        return cart.items.reduce((total, item) => {
          return total + item.price * item.quantity
        }, 0)
      })

      const increaseQuantity = (item: any) => {
        cart.updateQuantity(item.id, item.quantity + 1)
      }

      const decreaseQuantity = (item: any) => {
        if (item.quantity > 1) {
          cart.updateQuantity(item.id, item.quantity - 1)
        }
      }

      const removeItem = (item: any) => {
        if (confirm('Remove this item from cart?')) {
          cart.remove(item.id)
        }
      }

      const validateForm = () => {
        addressError.value = ''

        if (!shippingAddress.value.trim()) {
          addressError.value = 'Please enter a shipping address'
          return false
        }

        return true
      }

      const placeOrder = async () => {
        if (!validateForm()) return

        loading.value = true

        try {
          const orderData = {
            items: cartItems.value.map(item => ({
              product_id: item.id,
              quantity: item.quantity,
            })),
            shipping_address: shippingAddress.value.trim(),
          }

          await ordersStore.placeOrder(orderData)

          // Clear cart after successful order
          cart.clear()

          // Show success message and redirect
          alert('Order placed successfully!')
          router.push('/orders/customer')
        } catch (error_: any) {
          alert(error_.message || 'Failed to place order. Please try again.')
        } finally {
          loading.value = false
          showCheckoutModal.value = false
        }
      }

      return {
        cartItems,
        subtotal,
        loading,
        showCheckoutModal,
        shippingAddress,
        addressError,
        increaseQuantity,
        decreaseQuantity,
        removeItem,
        placeOrder,
      }
    },
  })
</script>

<style scoped>
.cart-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.cart-header {
  margin-bottom: 2rem;
}

.cart-header h1 {
  margin: 0;
  color: #333;
}

.items-count {
  color: #666;
  margin-top: 0.5rem;
}

.empty-cart {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
}

.cart-items {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.cart-item {
  display: grid;
  grid-template-columns: 120px 1fr auto;
  gap: 1.5rem;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-image img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
}

.item-details h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.item-price {
  color: #666;
  font-weight: 500;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0;
}

.quantity-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity {
  min-width: 40px;
  text-align: center;
}

.remove-btn {
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 0;
  font-size: 0.9rem;
}

.remove-btn:hover {
  text-decoration: underline;
}

.item-total {
  font-weight: bold;
  color: #333;
}

.cart-summary {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  height: fit-content;
}

.summary-details {
  margin: 1.5rem 0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  color: #666;
}

.summary-row.total {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
  border-top: 1px solid #eee;
  padding-top: 1rem;
  margin-top: 1rem;
}

.checkout-btn {
  width: 100%;
  background: #b0b0b0;
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.checkout-btn:hover:not(:disabled) {
  background: #999;
}

.checkout-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.continue-shopping,
.continue-shopping-link {
  display: inline-block;
  color: #666;
  text-decoration: none;
  margin-top: 1rem;
  font-size: 0.9rem;
}

.continue-shopping:hover,
.continue-shopping-link:hover {
  text-decoration: underline;
}

.checkout-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: #555;
  font-size: 0.9rem;
}

.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  resize: vertical;
}

.form-group textarea.error {
  border-color: #dc3545;
}

.error-text {
  color: #dc3545;
  font-size: 0.8rem;
}

.order-items {
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 1rem;
}

.order-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: #666;
}

.order-total {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.form-actions {
  display: flex;
  gap: 1rem;
}

.cancel-btn,
.submit-btn {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.cancel-btn {
  background: #e9ecef;
  color: #666;
}

.cancel-btn:hover {
  background: #dee2e6;
}

.submit-btn {
  background: #b0b0b0;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background: #999;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .cart-content {
    grid-template-columns: 1fr;
  }

  .cart-item {
    grid-template-columns: 100px 1fr;
  }

  .item-total {
    grid-column: 1 / -1;
    text-align: right;
  }
}
</style>
