import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Products from '../pages/Products'

function renderPage() {
  return render(
    <MemoryRouter>
      <Products />
    </MemoryRouter>,
  )
}

describe('Products page', () => {
  it('renders product cards after loading', async () => {
    renderPage()
    // Spinner shown first
    expect(document.querySelector('.bp5-spinner')).toBeTruthy()
    // Products appear
    await waitFor(() => {
      expect(screen.getByText('Widget A')).toBeInTheDocument()
      expect(screen.getByText('Widget B')).toBeInTheDocument()
    })
  })

  it('shows prices in USDC', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('10 USDC')).toBeInTheDocument()
      expect(screen.getByText('25 USDC')).toBeInTheDocument()
    })
  })

  it('renders buy buttons', async () => {
    renderPage()
    await waitFor(() => {
      const buttons = screen.getAllByText('Buy Now')
      expect(buttons).toHaveLength(2)
    })
  })
})
