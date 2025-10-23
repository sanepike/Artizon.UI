<template>
  <div class="product-list">
    <div class="search-bar">
      <input v-model="search" placeholder="Search products..." />
    </div>
    <div class="products">
      <ProductCard
        v-for="product in filteredProducts"
        :key="product.id"
        :name="product.name"
        :description="product.description"
        :price="product.price"
        :image="product.image_urls?.[0] || '/placeholder.png'"
      >
        <button class="add-to-cart" @click="addToCart(product)">
          Add to Cart
        </button>
      </ProductCard>
    </div>
    <div class="pagination">
      <button @click="prevPage" :disabled="page === 1">Prev</button>
      <span>Page {{ page }}</span>
      <button @click="nextPage" :disabled="page === totalPages">Next</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import ProductCard from "./ProductCard.vue";
import { useCartStore } from "../stores/cart";

export default defineComponent({
  name: "ProductList",
  components: {
    ProductCard,
  },
  setup() {
    const search = ref("");
    const products = ref<any[]>([]);
    const page = ref(1);
    const totalPages = ref(1);
    const limit = 10;
    const cart = useCartStore();

    const fetchProducts = async () => {
      // TODO: Replace with actual API URL
      const res = await fetch(
        `/api/products?page=${page.value}&limit=${limit}`
      );
      const data = await res.json();
      products.value = data.products;
      totalPages.value = data.total_pages;
    };

    onMounted(fetchProducts);

    const filteredProducts = computed(() => {
      if (!search.value) return products.value;
      return products.value.filter(
        (p) =>
          p.name.toLowerCase().includes(search.value.toLowerCase()) ||
          p.description.toLowerCase().includes(search.value.toLowerCase())
      );
    });

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

    const addToCart = (product: any) => {
      cart.add(product);
    };

    return {
      search,
      products,
      page,
      totalPages,
      filteredProducts,
      prevPage,
      nextPage,
      addToCart,
    };
  },
});
</script>

<style scoped>
.product-list {
  max-width: 900px;
  margin: 2rem auto;
  padding: 1rem;
}
.search-bar {
  margin-bottom: 1.5rem;
  text-align: center;
}
.search-bar input {
  width: 60%;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  background: #f9f9f9;
  font-size: 1rem;
}
.products {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}
.add-to-cart {
  margin-top: 0.75rem;
  background: #b0b0b0;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.add-to-cart:hover {
  background: #888;
}
.pagination {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}
</style>
