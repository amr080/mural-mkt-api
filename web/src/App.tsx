import { Routes, Route, Link } from 'react-router-dom'
import { Navbar, Alignment, Button } from '@blueprintjs/core'
import Products from './pages/Products'
import Checkout from './pages/Checkout'
import OrderStatus from './pages/OrderStatus'
import Merchant from './pages/Merchant'

export default function App() {
  return (
    <div style={{ minHeight: '100vh', background: '#f6f7f9' }}>
      <Navbar>
        <Navbar.Group align={Alignment.LEFT}>
          <Navbar.Heading>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              Mural Marketplace
            </Link>
          </Navbar.Heading>
          <Navbar.Divider />
          <Link to="/"><Button minimal icon="shop" text="Products" /></Link>
          <Link to="/merchant"><Button minimal icon="dashboard" text="Merchant" /></Link>
        </Navbar.Group>
      </Navbar>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px' }}>
        <Routes>
          <Route path="/" element={<Products />} />
          <Route path="/checkout/:productId" element={<Checkout />} />
          <Route path="/orders/:id" element={<OrderStatus />} />
          <Route path="/merchant" element={<Merchant />} />
        </Routes>
      </div>
    </div>
  )
}
