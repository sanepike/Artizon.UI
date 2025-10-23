<template>
  <form class="product-form" @submit.prevent="handleSubmit">
    <div class="form-group">
      <label for="name">Product Name</label>
      <input
        id="name"
        v-model="formData.name"
        :class="{ error: errors.name }"
        required
        type="text"
      />
      <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
    </div>

    <div class="form-group">
      <label for="description">Description</label>
      <textarea
        id="description"
        v-model="formData.description"
        :class="{ error: errors.description }"
        required
      />
      <span v-if="errors.description" class="error-text">{{
        errors.description
      }}</span>
    </div>

    <div class="form-group">
      <label for="price">Price (₹)</label>
      <input
        id="price"
        v-model.number="formData.price"
        :class="{ error: errors.price }"
        min="0"
        required
        step="0.01"
        type="number"
      />
      <span v-if="errors.price" class="error-text">{{ errors.price }}</span>
    </div>

    <div class="form-group">
      <label for="images">Product Images</label>
      <input
        id="images"
        accept="image/*"
        :class="{ error: errors.images }"
        multiple
        type="file"
        @change="handleImageChange"
      />
      <span v-if="errors.images" class="error-text">{{ errors.images }}</span>
    </div>

    <div v-if="imageUrls.length > 0" class="image-preview">
      <div v-for="(url, index) in imageUrls" :key="index" class="preview-item">
        <img alt="Product preview" :src="url" />
        <button class="remove-btn" type="button" @click="removeImage(index)">
          &times;
        </button>
      </div>
    </div>

    <div class="form-actions">
      <button class="cancel-btn" type="button" @click="$emit('cancel')">
        Cancel
      </button>
      <button class="submit-btn" :disabled="loading" type="submit">
        {{ loading ? "Saving..." : "Save Product" }}
      </button>
    </div>
  </form>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from "vue";

export default defineComponent({
  name: "ProductForm",
  props: {
    product: {
      type: Object as () => Record<string, any> | null,
      default: () => null,
    },
  },
  emits: ["submit", "cancel"],
  setup(props, { emit }) {
    const loading = ref(false);
    const imageFiles = ref<File[]>([]);
    const imageUrls = ref<string[]>([]);

    const formData = reactive({
      name: "",
      description: "",
      price: 0,
    });

    const errors = reactive({
      name: "",
      description: "",
      price: "",
      images: "",
    });

    const handleImageChange = (event: Event) => {
      const input = event.target as HTMLInputElement;
      if (!input.files?.length) return;

      const newFiles = Array.from(input.files);
      imageFiles.value = [...imageFiles.value, ...newFiles];

      // Create preview URLs
      for (const file of newFiles) {
        const url = URL.createObjectURL(file);
        imageUrls.value.push(url);
      }
    };

    const removeImage = (index: number) => {
      if (
        !imageUrls.value ||
        imageUrls.value.length === 0 ||
        index > imageUrls.value.length
      )
        return;
      const url = imageUrls.value[index];
      if (url) {
        URL.revokeObjectURL(url);
      }
      imageUrls.value.splice(index, 1);
      imageFiles.value.splice(index, 1);
    };

    const validateForm = () => {
      let isValid = true;
      errors.name = "";
      errors.description = "";
      errors.price = "";
      errors.images = "";

      if (!formData.name.trim()) {
        errors.name = "Product name is required";
        isValid = false;
      }

      if (!formData.description.trim()) {
        errors.description = "Description is required";
        isValid = false;
      }

      if (!formData.price || formData.price <= 0) {
        errors.price = "Please enter a valid price";
        isValid = false;
      }

      if (!props.product && imageFiles.value.length === 0) {
        errors.images = "At least one image is required";
        isValid = false;
      }

      return isValid;
    };

    const handleSubmit = () => {
      if (!validateForm()) return;

      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("description", formData.description);
      submitData.append("price", formData.price.toString());

      for (const file of imageFiles.value) {
        submitData.append("images", file);
      }

      emit("submit", submitData);
    };

    onMounted(() => {
      if (props.product) {
        formData.name = props.product.name;
        formData.description = props.product.description;
        formData.price = props.product.price;
        imageUrls.value = props.product.image_urls;
      }
    });

    return {
      formData,
      errors,
      loading,
      imageUrls,
      handleImageChange,
      removeImage,
      handleSubmit,
    };
  },
});
</script>

<style scoped>
.product-form {
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

.form-group input,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.form-group input[type="file"] {
  padding: 0.5rem;
}

.form-group input.error,
.form-group textarea.error {
  border-color: #dc3545;
}

.error-text {
  color: #dc3545;
  font-size: 0.8rem;
}

.image-preview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
}

.preview-item {
  position: relative;
}

.preview-item img {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
}

.remove-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #dc3545;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
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
</style>
