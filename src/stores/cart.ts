import { defineStore } from 'pinia'

export interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image_urls: string[]
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: JSON.parse(localStorage.getItem('cart') || '[]') as CartItem[],
  }),
  getters: {
    total (): number {
      return this.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      )
    },
    itemCount (): number {
      return this.items.reduce((count, item) => count + item.quantity, 0)
    },
  },
  actions: {
    add (product: Omit<CartItem, 'quantity'>) {
      const existing = this.items.find(item => item.id === product.id)
      if (existing) {
        existing.quantity = (existing.quantity || 1) + 1
      } else {
        this.items.push({ ...product, quantity: 1 })
      }
      this.save()
    },
    remove (productId: number) {
      this.items = this.items.filter(item => item.id !== productId)
      this.save()
    },
    updateQuantity (productId: number, quantity: number) {
      const item = this.items.find(item => item.id === productId)
      if (item) {
        item.quantity = Math.max(1, quantity)
        this.save()
      }
    },
    clear () {
      this.items = []
      this.save()
      localStorage.removeItem('cart')
    },
    save () {
      localStorage.setItem('cart', JSON.stringify(this.items))
    },
    load () {
      this.items = JSON.parse(localStorage.getItem('cart') || '[]')
    },
  },
})
