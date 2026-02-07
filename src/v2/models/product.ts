export interface Product {
  id: string
  name: string
  price: number
  currency: string
}

const products = new Map<string, Product>([
  ['prod_001', { id: 'prod_001', name: 'Widget A', price: 10, currency: 'MURALUSD' }],
  ['prod_002', { id: 'prod_002', name: 'Widget B', price: 25, currency: 'MURALUSD' }],
  ['prod_003', { id: 'prod_003', name: 'Widget C', price: 50, currency: 'MURALUSD' }],
  ['prod_004', { id: 'prod_004', name: 'Micro Widget', price: 0.0001, currency: 'USDC' }],
  ['prod_005', { id: 'prod_005', name: 'Starter Pack', price: 2.00, currency: 'USDC' }],
])

export const productModel = {
  findAll: (): Product[] => Array.from(products.values()),

  findById: (id: string): Product | undefined => products.get(id),
}
