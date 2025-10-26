import { useAuthStore } from '../stores/auth'

const API_BASE_URL
  = import.meta.env.VITE_API_URL || 'https://artizon-api.onrender.com'

export function pingBackend (): void {
  try {
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), 3000)

    fetch(API_BASE_URL, {
      method: 'GET',
      cache: 'no-store',
      mode: 'cors',
      signal: controller.signal,
    }).finally(() => {
      window.clearTimeout(timeoutId)
    })
  } catch {
    console.log('Backend ping failed')
  }
}

interface ApiOptions {
  method?: string
  body?: any
  headers?: Record<string, string>
  requiresAuth?: boolean
}

async function apiClient (endpoint: string, options: ApiOptions = {}) {
  const { method = 'GET', body, headers = {}, requiresAuth = false } = options

  const auth = useAuthStore()

  // Create a new headers object to avoid mutation issues
  const requestHeaders: Record<string, string> = { ...headers }

  // Add auth header if required and token exists
  if (requiresAuth) {
    const token = localStorage.getItem('access_token')
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`
    }
  }

  // Add default headers (only for JSON content)
  if (!requestHeaders['Content-Type'] && !(body instanceof FormData)) {
    requestHeaders['Content-Type'] = 'application/json'
  }

  const config: RequestInit = {
    method,
    headers: requestHeaders,
    body:
      body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

    // Handle 401 Unauthorized
    if (response.status === 401 && requiresAuth) {
      auth.logout()
      window.location.href = '/auth/login'
      throw new Error('Session expired. Please login again.')
    }

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'An error occurred')
    }

    return data
  } catch (error: any) {
    throw new Error(error.message || 'Network error occurred')
  }
}

export const authApi = {
  login: (email: string, password: string) =>
    apiClient('/auth/login', {
      method: 'POST',
      body: { email, password },
    }),

  signup: (userData: {
    first_name: string
    last_name: string
    email: string
    password: string
    user_type: 'vendor' | 'customer'
  }) =>
    apiClient('/auth/signup', {
      method: 'POST',
      body: userData,
    }),

  getProfile: () =>
    apiClient('/auth/profile', {
      requiresAuth: true,
    }),
}

export const productsApi = {
  getProducts: (page = 1, limit = 10) =>
    apiClient(`/products?page=${page}&limit=${limit}`),

  getMyProducts: (page = 1, limit = 10) =>
    apiClient(`/products/my?page=${page}&limit=${limit}`),

  getProduct: (id: number) => apiClient(`/products/${id}`),

  createProduct: (productData: FormData) =>
    apiClient('/products/create', {
      method: 'POST',
      body: productData,
      requiresAuth: true,
    }),

  updateProduct: (id: number, productData: FormData) =>
    apiClient(`/products/${id}`, {
      method: 'PUT',
      body: productData,
      requiresAuth: true,
    }),

  deleteProduct: (id: number) =>
    apiClient(`/products/${id}`, {
      method: 'DELETE',
      requiresAuth: true,
    }),
}

export const ordersApi = {
  placeOrder: (orderData: {
    items: Array<{ product_id: number, quantity: number }>
    shipping_address: string
  }) =>
    apiClient('/orders/place', {
      method: 'POST',
      body: orderData,
      requiresAuth: true,
    }),

  getMyOrders: (page = 1, limit = 10) =>
    apiClient(`/orders/my?page=${page}&limit=${limit}`, {
      requiresAuth: true,
    }),

  getOrders: () =>
    apiClient('/orders/my', {
      requiresAuth: true,
    }),

  getOrder: (id: number) =>
    apiClient(`/orders/${id}`, {
      requiresAuth: true,
    }),

  getVendorOrders: (page = 1, limit = 10) =>
    apiClient(`/orders/vendor?page=${page}&limit=${limit}`, {
      requiresAuth: true,
    }),

  updateOrderStatus: (orderId: number, status: string) =>
    apiClient(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: { status },
      requiresAuth: true,
    }),
}
