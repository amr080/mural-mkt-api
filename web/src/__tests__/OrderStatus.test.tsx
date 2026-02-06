import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '../test/server'
import { mockPaidOrder, mockOrder } from '../test/mocks'
import OrderStatus from '../pages/OrderStatus'

function renderPage(orderId: string) {
  return render(
    <MemoryRouter initialEntries={[`/orders/${orderId}`]}>
      <Routes>
        <Route path="/orders/:id" element={<OrderStatus />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('OrderStatus page', () => {
  it('renders pending order with payment instructions', async () => {
    renderPage(mockOrder.id)
    await waitFor(() => {
      expect(screen.getByText(/Awaiting Payment/)).toBeInTheDocument()
      expect(screen.getByText('0xDEPOSIT')).toBeInTheDocument()
      expect(screen.getAllByText(/20 USDC/).length).toBeGreaterThanOrEqual(1)
    })
  })

  it('renders paid order with confirmation', async () => {
    server.use(
      http.get('/api/orders/:id', () => HttpResponse.json(mockPaidOrder)),
    )
    renderPage(mockOrder.id)
    await waitFor(() => {
      expect(screen.getByText(/Payment Confirmed/)).toBeInTheDocument()
      expect(screen.getByText('0xTXHASH123')).toBeInTheDocument()
    })
  })

  it('shows error for unknown order', async () => {
    renderPage('unknown-id')
    await waitFor(() => {
      expect(screen.getByText('Order not found')).toBeInTheDocument()
    })
  })
})
