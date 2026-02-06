import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Merchant from '../pages/Merchant'

function renderPage() {
  return render(
    <MemoryRouter>
      <Merchant />
    </MemoryRouter>,
  )
}

describe('Merchant page', () => {
  it('renders orders tab with order data', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Merchant Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Orders (1)')).toBeInTheDocument()
      expect(screen.getByText('20 USDC')).toBeInTheDocument()
    })
  })

  it('renders payouts tab', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Payouts (0)')).toBeInTheDocument()
    })
  })

  it('shows order status tag', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('pending')).toBeInTheDocument()
    })
  })
})
