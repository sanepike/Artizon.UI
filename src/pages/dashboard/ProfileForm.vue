<template>
  <form class="profile-form" @submit.prevent="handleSubmit">
    <div class="form-group">
      <label for="firstName">First Name</label>
      <input
        id="firstName"
        v-model="formData.first_name"
        :class="{ error: errors.first_name }"
        required
        type="text"
      >
      <span v-if="errors.first_name" class="error-text">{{
        errors.first_name
      }}</span>
    </div>

    <div class="form-group">
      <label for="lastName">Last Name</label>
      <input
        id="lastName"
        v-model="formData.last_name"
        :class="{ error: errors.last_name }"
        required
        type="text"
      >
      <span v-if="errors.last_name" class="error-text">{{
        errors.last_name
      }}</span>
    </div>

    <div class="form-group">
      <label for="email">Email</label>
      <input
        id="email"
        v-model="formData.email"
        :class="{ error: errors.email }"
        required
        type="email"
      >
      <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
    </div>

    <div class="form-actions">
      <button class="cancel-btn" type="button" @click="$emit('cancel')">
        Cancel
      </button>
      <button class="submit-btn" :disabled="loading" type="submit">
        {{ loading ? "Saving..." : "Save Changes" }}
      </button>
    </div>
  </form>
</template>

<script lang="ts">
  import { defineComponent, onMounted, reactive, ref } from 'vue'

  export default defineComponent({
    name: 'ProfileForm',
    props: {
      user: {
        type: Object,
        required: true,
      },
    },
    emits: ['submit', 'cancel'],
    setup (props, { emit }) {
      const loading = ref(false)

      const formData = reactive({
        first_name: '',
        last_name: '',
        email: '',
      })

      const errors = reactive({
        first_name: '',
        last_name: '',
        email: '',
      })

      const validateForm = () => {
        let isValid = true
        errors.first_name = ''
        errors.last_name = ''
        errors.email = ''

        if (!formData.first_name.trim()) {
          errors.first_name = 'First name is required'
          isValid = false
        }

        if (!formData.last_name.trim()) {
          errors.last_name = 'Last name is required'
          isValid = false
        }

        if (!formData.email) {
          errors.email = 'Email is required'
          isValid = false
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          errors.email = 'Please enter a valid email'
          isValid = false
        }

        return isValid
      }

      const handleSubmit = () => {
        if (!validateForm()) return

        const submitData = new FormData()
        submitData.append('first_name', formData.first_name)
        submitData.append('last_name', formData.last_name)
        submitData.append('email', formData.email)

        emit('submit', submitData)
      }

      onMounted(() => {
        if (props.user) {
          formData.first_name = props.user.first_name
          formData.last_name = props.user.last_name
          formData.email = props.user.email
        }
      })

      return {
        formData,
        errors,
        loading,
        handleSubmit,
      }
    },
  })
</script>

<style scoped>
.profile-form {
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

.form-group input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input.error {
  border-color: #dc3545;
}

.error-text {
  color: #dc3545;
  font-size: 0.8rem;
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
