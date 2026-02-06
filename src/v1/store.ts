import { Product, Order } from './types'

const products = new Map<string, Product>([
  ['prod_001', { id: 'prod_001', name: 'Widget A', price: 10, currency: 'USDC' }],
  ['prod_002', { id: 'prod_002', name: 'Widget B', price: 25, currency: 'USDC' }],
  ['prod_003', { id: 'prod_003', name: 'Widget C', price: 50, currency: 'USDC' }],
  ['prod_004', { id: 'prod_004', name: 'Micro Widget', price: 0.0001, currency: 'USDC' }],
])

const orders = new Map<string, Order>()
const processedTxHashes = new Set<string>()

export const store = {
  getProducts: (): Product[] => Array.from(products.values()),
  getProduct: (id: string): Product | undefined => products.get(id),

  getOrders: (): Order[] => Array.from(orders.values()),
  getOrder: (id: string): Order | undefined => orders.get(id),
  createOrder: (order: Order): Order => { orders.set(order.id, order); return order },
  updateOrder: (id: string, updates: Partial<Order>): Order | undefined => {
    const order = orders.get(id)
    if (!order) return undefined
    const updated = { ...order, ...updates }
    orders.set(id, updated)
    return updated
  },

  hasProcessedTx: (hash: string): boolean => processedTxHashes.has(hash),
  markTxProcessed: (hash: string): void => { processedTxHashes.add(hash) },
}
