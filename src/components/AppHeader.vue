<template>
  <header class="app-header">
    <div class="header-content">
      <!-- Logo/Brand -->
      <div class="brand">
        <router-link to="/">
          <h1>Artizons</h1>
        </router-link>
      </div>

      <!-- Navigation Links -->
      <nav v-if="auth.isAuthenticated" class="nav-links">
        <router-link to="/dashboard"> Dashboard </router-link>

        <router-link v-if="auth.isCustomer" class="cart-link" to="/cart">
          <span class="cart-icon">🛒</span>
          <span v-if="cart.itemCount > 0" class="cart-badge">
            {{ cart.itemCount }}
          </span>
          Cart
        </router-link>
      </nav>

      <!-- User Info & Logout -->
      <div v-if="auth.isAuthenticated" class="user-section">
        <div v-if="auth.user" class="user-info">
          <span class="user-name">{{ auth.user.first_name }} {{ auth.user.last_name }}</span>
          <span
            class="user-type-badge"
            :class="auth.user.user_type.toLowerCase()"
          >
            {{ auth.user.user_type }}
          </span>
        </div>
        <button class="logout-btn" @click="handleLogout">Logout</button>
      </div>
    </div>
  </header>
</template>

<script lang="ts">
  import { computed, defineComponent } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '../stores/auth'
  import { useCartStore } from '../stores/cart'

  export default defineComponent({
    name: 'AppHeader',
    setup () {
      const router = useRouter()
      const authStore = useAuthStore()
      const cartStore = useCartStore()

      const auth = computed(() => authStore)
      const cart = computed(() => cartStore)

      const handleLogout = () => {
        authStore.logout()
        router.push('/')
      }

      return {
        auth,
        cart,
        handleLogout,
      }
    },
  })
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: white;
  border-bottom: 2px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

/* Brand/Logo */
.brand a {
  text-decoration: none;
  color: #333;
}

.brand h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #555;
}

.brand h1:hover {
  color: #888;
}

/* Navigation Links */
.nav-links {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex: 1;
  justify-content: center;
}

.nav-links a {
  text-decoration: none;
  color: #666;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.2s;
  position: relative;
}

.nav-links a:hover {
  color: #333;
  background: #f5f5f5;
}

.nav-links a.router-link-active {
  color: #333;
  background: #e8e8e8;
}

/* Cart Link */
.cart-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
}

.cart-icon {
  font-size: 1.2rem;
}

.cart-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ff6b6b;
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
  padding: 0.15rem 0.4rem;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

/* User Section */
.user-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-name {
  color: #555;
  font-weight: 500;
  font-size: 0.9rem;
}

.user-type-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.25rem 0.6rem;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.user-type-badge.vendor {
  background: #e3f2fd;
  color: #1976d2;
}

.user-type-badge.customer {
  background: #f3e5f5;
  color: #7b1fa2;
}

.logout-btn {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.logout-btn:hover {
  background: #ff5252;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .header-content {
    padding: 1rem;
    gap: 1rem;
  }

  .brand h1 {
    font-size: 1.2rem;
  }

  .nav-links {
    gap: 1rem;
    font-size: 0.9rem;
  }

  .user-name {
    display: none;
  }

  .user-type-badge {
    font-size: 0.65rem;
    padding: 0.2rem 0.5rem;
  }

  .logout-btn {
    padding: 0.5rem 0.8rem;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .nav-links a {
    padding: 0.4rem 0.6rem;
    font-size: 0.85rem;
  }

  .cart-badge {
    font-size: 0.65rem;
  }
}
</style>
