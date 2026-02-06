import type { Product, Order } from '../types'

export const mockProducts: Product[] = [
  { id: 'prod_001', name: 'Widget A', price: 10, currency: 'USDC' },
  { id: 'prod_002', name: 'Widget B', price: 25, currency: 'USDC' },
]

export const mockOrder: Order = {
  id: 'ord_abc-123',
  productId: 'prod_001',
  quantity: 2,
  total: 20,
  status: 'pending',
  customerWallet: '0xABC',
  depositAddress: '0xDEPOSIT',
  createdAt: '2025-01-01T00:00:00.000Z',
}

export const mockPaidOrder: Order = {
  ...mockOrder,
  status: 'paid',
  txHash: '0xTXHASH123',
  paidAt: '2025-01-01T01:00:00.000Z',
  payoutId: 'payout_xyz',
}
