import { http, HttpResponse } from 'msw'
import { mockProducts, mockOrder } from './mocks'

export const handlers = [
  http.get('/api/products', () => HttpResponse.json(mockProducts)),

  http.get('/api/products/:id', ({ params }) => {
    const p = mockProducts.find((x) => x.id === params.id)
    if (!p) return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    return HttpResponse.json(p)
  }),

  http.post('/api/orders', async ({ request }) => {
    const body = (await request.json()) as any
    return HttpResponse.json(
      {
        ...mockOrder,
        productId: body.productId,
        quantity: body.quantity,
        customerWallet: body.customerWallet,
        total: (mockProducts.find((p) => p.id === body.productId)?.price ?? 0) * body.quantity,
      },
      { status: 201 },
    )
  }),

  http.get('/api/orders', () => HttpResponse.json([mockOrder])),

  http.get('/api/orders/:id', ({ params }) => {
    if (params.id === mockOrder.id) return HttpResponse.json(mockOrder)
    return HttpResponse.json({ error: 'Not found' }, { status: 404 })
  }),

  http.get('/api/payouts', () => HttpResponse.json([])),
]
