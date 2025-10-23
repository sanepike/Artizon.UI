import { defineStore } from 'pinia'

export interface User {
  first_name: string
  last_name: string
  email: string
  user_type: 'vendor' | 'customer'
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: localStorage.getItem('access_token'),
    isAuthenticated: !!localStorage.getItem('access_token'),
  }),

  getters: {
    isVendor: state => state.user?.user_type === 'vendor',
    isCustomer: state => state.user?.user_type === 'customer',
  },

  actions: {
    setToken (token: string) {
      this.token = token
      this.isAuthenticated = true
      localStorage.setItem('access_token', token)
    },

    async fetchUserProfile () {
      if (!this.token) {
        return
      }

      try {
        const { authApi } = await import('../services/api')
        this.user = await authApi.getProfile()
      } catch (error) {
        console.error('Error fetching user profile:', error)
        this.logout()
      }
    },

    logout () {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      localStorage.removeItem('access_token')
    },

    async initialize () {
      if (this.token) {
        await this.fetchUserProfile()
      }
    },
  },
})
