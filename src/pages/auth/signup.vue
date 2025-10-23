<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>Create an Account</h2>
      <form class="auth-form" @submit.prevent="handleSignup">
        <div class="form-group">
          <label for="firstName">First Name</label>
          <input
            id="firstName"
            v-model="formData.first_name"
            :class="{ error: errors.first_name }"
            required
            type="text"
          />
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
          />
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
          />
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
          />
          <span v-if="errors.password" class="error-text">{{
            errors.password
          }}</span>
        </div>
        <div class="form-group">
          <label for="userType">Account Type</label>
          <select
            id="userType"
            v-model="formData.user_type"
            :class="{ error: errors.user_type }"
            required
          >
            <option value="">Select account type</option>
            <option value="Customer">Customer</option>
            <option value="Vendor">Vendor</option>
          </select>
          <span v-if="errors.user_type" class="error-text">{{
            errors.user_type
          }}</span>
        </div>
        <button class="submit-btn" :disabled="loading" type="submit">
          {{ loading ? "Creating Account..." : "Sign Up" }}
        </button>
        <p v-if="error" class="error-message">{{ error }}</p>
      </form>
      <p class="auth-link">
        Already have an account?
        <router-link to="/auth/login">Login</router-link>
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { authApi } from "../../services/api";
import { useAuthStore } from "../../stores/auth";

export default defineComponent({
  name: "SignupPage",
  setup() {
    const router = useRouter();
    const auth = useAuthStore();
    const loading = ref(false);
    const error = ref("");

    const formData = reactive({
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      user_type: "",
    });

    const errors = reactive({
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      user_type: "",
    });

    const validateForm = () => {
      let isValid = true;
      // Reset all errors
      for (const key of Object.keys(errors)) {
        errors[key as keyof typeof errors] = "";
      }

      if (!formData.first_name.trim()) {
        errors.first_name = "First name is required";
        isValid = false;
      }

      if (!formData.last_name.trim()) {
        errors.last_name = "Last name is required";
        isValid = false;
      }

      if (!formData.email) {
        errors.email = "Email is required";
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = "Please enter a valid email";
        isValid = false;
      }

      if (!formData.password) {
        errors.password = "Password is required";
        isValid = false;
      } else if (formData.password.length < 6) {
        errors.password = "Password must be at least 6 characters";
        isValid = false;
      }

      if (!formData.user_type) {
        errors.user_type = "Please select an account type";
        isValid = false;
      }

      return isValid;
    };

    const handleSignup = async () => {
      if (!validateForm()) return;

      loading.value = true;
      error.value = "";

      try {
        const data = await authApi.signup({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
          user_type: formData.user_type as "Vendor" | "Customer",
        });

        if (data?.access_token) {
          auth.setToken(data.access_token);
          await auth.fetchUserProfile();
          await router.push("/dashboard");
        } else {
          error.value = "Failed to create account. Please try again.";
        }
      } catch (error_: any) {
        error.value =
          error_?.message || "An error occurred. Please try again later.";
      } finally {
        loading.value = false;
      }
    };

    return {
      formData,
      errors,
      loading,
      error,
      handleSignup,
    };
  },
});
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: #f5f5f5;
  /* Ensure light appearance on devices in dark mode */
  color-scheme: light;
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

.form-group input,
.form-group select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background-color: #fff;
  color: #333;
  caret-color: #333;
}

.form-group input.error,
.form-group select.error {
  border-color: #dc3545;
}

/* Placeholder color for better visibility on mobile */
.form-group input::placeholder {
  color: #888;
  opacity: 1;
}

/* Fix mobile dark mode/autofill making text white on white bg */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
select:-webkit-autofill,
textarea:-webkit-autofill {
  -webkit-text-fill-color: #333 !important;
  box-shadow: 0 0 0px 1000px #fff inset;
  transition: background-color 9999s ease-out 0s;
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
  margin-top: 0.5rem;
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
