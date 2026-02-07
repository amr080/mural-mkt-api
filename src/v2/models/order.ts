export type OrderStatus = 'pending' | 'paid' | 'converting' | 'converted' | 'expired'

export interface Order {
  id: string
  merchantId: string
  productId: string
  quantity: number
  total: number
  tokenSymbol: string
  status: OrderStatus
  customerWallet: string
  depositAddress: string
  createdAt: string
  txHash?: string
  paidAt?: string
  payoutId?: string
}

const orders = new Map<string, Order>()
const processedTxHashes = new Set<string>()

export const orderModel = {
  findAll: (): Order[] => Array.from(orders.values()),

  findById: (id: string): Order | undefined => orders.get(id),

  create: (order: Order): Order => {
    orders.set(order.id, order)
    return order
  },

  update: (id: string, updates: Partial<Order>): Order | undefined => {
    const order = orders.get(id)
    if (!order) return undefined
    const updated = { ...order, ...updates }
    orders.set(id, updated)
    return updated
  },

  findPendingMatch: (amount: number, depositAddress: string): Order | undefined => {
    return Array.from(orders.values()).find(
      o => o.status === 'pending' &&
        o.total === amount &&
        o.depositAddress.toLowerCase() === depositAddress.toLowerCase()
    )
  },

  hasTx: (hash: string): boolean => processedTxHashes.has(hash),

  markTx: (hash: string): void => { processedTxHashes.add(hash) },
}
