import { Card, Elevation, Button } from '@blueprintjs/core'
import { useNavigate } from 'react-router-dom'
import type { Product } from '../types'

export default function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate()

  return (
    <Card
      elevation={Elevation.TWO}
      style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
    >
      <h3 style={{ margin: 0 }}>{product.name}</h3>
      <p style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
        {product.price} {product.currency}
      </p>
      <Button
        intent="primary"
        text="Buy Now"
        onClick={() => navigate(`/checkout/${product.id}`)}
      />
    </Card>
  )
}
