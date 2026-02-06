import type { Product, Order, CreateOrderBody } from '../types'

const BASE = '/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed: ${res.status}`)
  }
  return res.json()
}

export const api = {
  getProducts: () => request<Product[]>('/products'),
  getProduct: (id: string) => request<Product>(`/products/${id}`),

  getOrders: () => request<Order[]>('/orders'),
  getOrder: (id: string) => request<Order>(`/orders/${id}`),
  createOrder: (body: CreateOrderBody) =>
    request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getPayouts: () => request<any[]>('/payouts'),
  getPayout: (id: string) => request<any>(`/payouts/${id}`),
}
