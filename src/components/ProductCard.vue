<template>
  <div class="product-card">
    <img alt="Product Image" class="product-image" :src="imageUrl" />
    <div class="product-info">
      <h3>{{ name }}</h3>
      <p class="description">{{ description }}</p>
      <div class="price">₹{{ price.toFixed(2) }}</div>
      <button class="add-to-cart-btn" @click="handleAddToCart">
        Add to Cart
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ProductCard",
  props: {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    imageUrl: {
      type: String,
      default: "/placeholder.png",
    },
  },
  emits: ["add-to-cart"],
  setup(props, { emit }) {
    const handleAddToCart = () => {
      emit("add-to-cart");
    };

    return {
      handleAddToCart,
    };
  },
});
</script>

<style scoped>
.product-card {
  background: #f7f7f7;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  padding: 1rem;
  display: flex;
  flex-direction: row;
  gap: 16px;
  align-items: center;
  justify-content: flex-start;
  transition: box-shadow 0.2s;
}
.product-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}
.product-image {
  width: 180px;
  height: 180px;
  object-fit: cover;
  border-radius: 6px;
  background: #e0e0e0;
  margin-bottom: 1rem;
}

.price {
  color: #6c757d;
  font-weight: bold;
  margin-top: 0.5rem;
}
.description {
  color: #888;
  font-size: 0.95rem;
  margin: 0.5rem 0;
}
.add-to-cart-btn {
  background: #b0b0b0;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
  margin-top: 0.75rem;
  width: 100%;
}
.add-to-cart-btn:hover {
  background: #888;
}
</style>
