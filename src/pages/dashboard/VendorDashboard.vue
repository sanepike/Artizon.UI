<template>
  <div class="vendor-dashboard">
    <header class="dashboard-header">
      <h1>Vendor Dashboard</h1>
      <div class="header-actions">
        <button class="view-orders-btn" @click="goToOrders">
          📦 View Orders
        </button>
        <button class="add-product-btn" @click="showAddProductModal = true">
          Add New Product
        </button>
      </div>
    </header>

    <div class="dashboard-stats">
      <div class="stat-card">
        <h3>Total Products</h3>
        <p>{{ totalProducts }}</p>
      </div>
      <div class="stat-card">
        <h3>Total Orders</h3>
        <p>{{ totalOrders }}</p>
      </div>
      <div class="stat-card">
        <h3>Revenue</h3>
        <p>₹{{ totalRevenue.toFixed(2) }}</p>
      </div>
    </div>

    <section class="products-section">
      <h2>Your Products</h2>
      <div class="products-grid">
        <div v-for="product in products" :key="product.id" class="product-card">
          <img :alt="product.name" :src="product.images[0]?.url">
          <div class="product-info">
            <h3>{{ product.name }}</h3>
            <div class="text-body-2">
              {{ product.description }}
            </div>
            <div class="price">₹{{ product.price.toFixed(2) }}</div>
            <div class="actions">
              <button class="delete-btn" @click="deleteProduct(product.id)">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Add/Edit Product Modal -->
    <Modal v-model="showAddProductModal" title="Add New Product">
      <ProductForm
        :product="editingProduct"
        @cancel="closeProductModal"
        @submit="handleProductSubmit"
      />
    </Modal>
  </div>
</template>

<script lang="ts">
  import { defineComponent, onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import Modal from '../../components/Modal.vue'
  import { ordersApi, productsApi } from '../../services/api'
  import ProductForm from './ProductForm.vue'

  interface Image {
    is_primary: boolean
    url: string
  }

  interface Product {
    id: number
    name: string
    description: string
    price: number
    images: Image[]
    vendor_id: number
  }

  export default defineComponent({
    name: 'VendorDashboard',
    components: {
      Modal,
      ProductForm,
    },
    setup () {
      const router = useRouter()
      const products = ref<Product[]>([])
      const totalProducts = ref(0)
      const totalOrders = ref(0)
      const totalRevenue = ref(0)
      const showAddProductModal = ref(false)
      const editingProduct = ref<Product | null>(null)

      const fetchProducts = async () => {
        try {
          const response = await productsApi.getProducts()
          products.value = response.products
          totalProducts.value = response.products.length
        } catch (error) {
          console.error('Error fetching products:', error)
        }
      }

      const fetchVendorOrders = async () => {
        try {
          const response = await ordersApi.getVendorOrders(1, 100)
          const orders = response.orders || []

          // Calculate total orders count
          totalOrders.value = orders.length

          // Calculate total revenue from all orders
          totalRevenue.value = orders.reduce(
            (sum: number, order: any) => sum + (order.total_amount || 0),
            0,
          )
        } catch (error) {
          console.error('Error fetching vendor orders:', error)
        }
      }

      const editProduct = (product: Product) => {
        editingProduct.value = product
        showAddProductModal.value = true
      }

      const deleteProduct = async (productId: number) => {
        if (!confirm('Are you sure you want to delete this product?')) return

        try {
          await productsApi.deleteProduct(productId)
          await fetchProducts()
        } catch (error) {
          console.error('Error deleting product:', error)
        }
      }

      const handleProductSubmit = async (formData: FormData) => {
        try {
          await (editingProduct.value
            ? productsApi.updateProduct(editingProduct.value.id, formData)
            : productsApi.createProduct(formData))
          await fetchProducts()
          closeProductModal()
        } catch (error) {
          console.error('Error saving product:', error)
        }
      }

      const closeProductModal = () => {
        showAddProductModal.value = false
        editingProduct.value = null
      }

      const goToOrders = () => {
        router.push('/orders/vendor')
      }

      onMounted(() => {
        fetchProducts()
        fetchVendorOrders()
      })

      return {
        products,
        totalProducts,
        totalOrders,
        totalRevenue,
        showAddProductModal,
        editingProduct,
        editProduct,
        deleteProduct,
        handleProductSubmit,
        closeProductModal,
        goToOrders,
      }
    },
  })
</script>

<style scoped>
.vendor-dashboard {
  width: 100%;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.view-orders-btn {
  background: #4caf50;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.view-orders-btn:hover {
  background: #45a049;
}

.add-product-btn {
  background: #b0b0b0;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.add-product-btn:hover {
  background: #999;
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-card h3 {
  color: #666;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.stat-card p {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.products-section {
  margin-top: 2rem;
}

.products-section h2 {
  margin-bottom: 1rem;
  color: #333;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.product-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.product-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.product-info {
  padding: 1rem;
}

.product-info h3 {
  margin: 0;
  color: #333;
  font-size: 1.1rem;
}

.price {
  color: #666;
  font-weight: bold;
  margin: 0.5rem 0;
}

.actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.edit-btn,
.delete-btn {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.edit-btn {
  background: #b0b0b0;
  color: white;
}

.edit-btn:hover {
  background: #999;
}

.delete-btn {
  background: #f8d7da;
  color: #721c24;
}

.delete-btn:hover {
  background: #f5c6cb;
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .header-actions {
    width: 100%;
    flex-direction: column;
  }

  .view-orders-btn,
  .add-product-btn {
    width: 100%;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }
}
</style>
