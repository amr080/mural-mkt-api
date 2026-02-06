import { describe, it, expect } from 'vitest'
import { api } from '../api/client'
import { mockProducts, mockOrder } from '../test/mocks'

describe('api client', () => {
  it('getProducts returns product array', async () => {
    const products = await api.getProducts()
    expect(products).toHaveLength(mockProducts.length)
    expect(products[0].id).toBe('prod_001')
  })

  it('getProduct returns single product', async () => {
    const product = await api.getProduct('prod_001')
    expect(product.name).toBe('Widget A')
    expect(product.price).toBe(10)
  })

  it('getProduct throws on 404', async () => {
    await expect(api.getProduct('nonexistent')).rejects.toThrow('Not found')
  })

  it('createOrder posts and returns order', async () => {
    const order = await api.createOrder({
      productId: 'prod_001',
      quantity: 2,
      customerWallet: '0xABC',
    })
    expect(order.productId).toBe('prod_001')
    expect(order.quantity).toBe(2)
    expect(order.total).toBe(20)
    expect(order.status).toBe('pending')
  })

  it('getOrders returns array', async () => {
    const orders = await api.getOrders()
    expect(orders).toHaveLength(1)
    expect(orders[0].id).toBe(mockOrder.id)
  })

  it('getOrder returns single order', async () => {
    const order = await api.getOrder(mockOrder.id)
    expect(order.id).toBe(mockOrder.id)
  })

  it('getPayouts returns array', async () => {
    const payouts = await api.getPayouts()
    expect(payouts).toEqual([])
  })
})
