import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Checkout from '../pages/Checkout'

function renderPage(productId = 'prod_001') {
  return render(
    <MemoryRouter initialEntries={[`/checkout/${productId}`]}>
      <Routes>
        <Route path="/checkout/:productId" element={<Checkout />} />
        <Route path="/orders/:id" element={<div>Order Page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('Checkout page', () => {
  it('loads product details', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText(/Checkout: Widget A/)).toBeInTheDocument()
      expect(screen.getByText(/10 USDC/)).toBeInTheDocument()
    })
  })

  it('disables submit when wallet is empty', async () => {
    renderPage()
    await waitFor(() => screen.getByText('Place Order'))
    const btn = screen.getByText('Place Order').closest('button')!
    expect(btn).toBeDisabled()
  })

  it('submits order and shows deposit address', async () => {
    const user = userEvent.setup()
    renderPage()

    await waitFor(() => screen.getByText('Place Order'))

    const walletInput = screen.getByPlaceholderText('0x...')
    await user.type(walletInput, '0xABC')

    const btn = screen.getByText('Place Order')
    expect(btn).not.toBeDisabled()
    await user.click(btn)

    await waitFor(() => {
      expect(screen.getByText('Order Created')).toBeInTheDocument()
      expect(screen.getByText('0xDEPOSIT')).toBeInTheDocument()
    })
  })

  it('shows error for nonexistent product', async () => {
    renderPage('nonexistent')
    await waitFor(() => {
      expect(screen.getByText('Product not found')).toBeInTheDocument()
    })
  })
})
