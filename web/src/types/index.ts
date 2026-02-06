export type OrderStatus = 'pending' | 'paid' | 'expired'

export interface Product {
  id: string
  name: string
  price: number
  currency: 'USDC'
}

export interface Order {
  id: string
  productId: string
  quantity: number
  total: number
  status: OrderStatus
  customerWallet: string
  depositAddress: string
  createdAt: string
  txHash?: string
  paidAt?: string
  payoutId?: string
}

export interface CreateOrderBody {
  productId: string
  quantity: number
  customerWallet: string
}
