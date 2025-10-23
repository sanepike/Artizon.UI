<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>Login to Artizons</h2>
      <form class="auth-form" @submit.prevent="handleLogin">
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
        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="formData.password"
            :class="{ error: errors.password }"
            required
            type="password"
          >
          <span v-if="errors.password" class="error-text">{{
            errors.password
          }}</span>
        </div>
        <button class="submit-btn" :disabled="loading" type="submit">
          {{ loading ? "Logging in..." : "Login" }}
        </button>
        <p v-if="error" class="error-message">{{ error }}</p>
      </form>
      <p class="auth-link">
        Don't have an account?
        <router-link to="/auth/signup">Sign up</router-link>
      </p>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, reactive, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { authApi } from '../../services/api'
  import { useAuthStore } from '../../stores/auth'

  export default defineComponent({
    name: 'LoginPage',
    setup () {
      const router = useRouter()
      const auth = useAuthStore()
      const loading = ref(false)
      const error = ref('')

      const formData = reactive({
        email: '',
        password: '',
      })

      const errors = reactive({
        email: '',
        password: '',
      })

      const validateForm = () => {
        let isValid = true
        errors.email = ''
        errors.password = ''

        if (!formData.email) {
          errors.email = 'Email is required'
          isValid = false
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          errors.email = 'Please enter a valid email'
          isValid = false
        }

        if (!formData.password) {
          errors.password = 'Password is required'
          isValid = false
        }

        return isValid
      }

      const handleLogin = async () => {
        if (!validateForm()) return

        loading.value = true
        error.value = ''

        try {
          const data = await authApi.login(formData.email, formData.password)
          auth.setToken(data.access_token)
          await router.push('/dashboard') // Redirect to home page
        } catch {
          error.value = 'An error occurred. Please try again later.'
        } finally {
          loading.value = false
        }
      }

      return {
        formData,
        errors,
        loading,
        error,
        handleLogin,
      }
    },
  })
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: #f5f5f5;
}

.auth-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.auth-card h2 {
  text-align: center;
  color: #333;
  margin-bottom: 1.5rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

.submit-btn {
  background: #b0b0b0;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #999;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error-message {
  color: #dc3545;
  text-align: center;
  margin-top: 1rem;
}

.auth-link {
  text-align: center;
  margin-top: 1rem;
  color: #666;
}

.auth-link a {
  color: #888;
  text-decoration: none;
  font-weight: 500;
}

.auth-link a:hover {
  text-decoration: underline;
}
</style>
