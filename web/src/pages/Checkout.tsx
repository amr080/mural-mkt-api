import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card, Elevation, FormGroup, InputGroup, NumericInput,
  Button, Callout, Spinner, NonIdealState,
} from '@blueprintjs/core'
import { api } from '../api/client'
import type { Product, Order } from '../types'

export default function Checkout() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [quantity, setQuantity] = useState(1)
  const [wallet, setWallet] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (!productId) return
    api.getProduct(productId)
      .then(setProduct)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [productId])

  const handleSubmit = async () => {
    if (!productId || !wallet.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const created = await api.createOrder({
        productId,
        quantity,
        customerWallet: wallet.trim(),
      })
      setOrder(created)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Spinner />
  if (!product) return <NonIdealState icon="error" title="Product not found" description={error || undefined} />

  if (order) {
    return (
      <Card elevation={Elevation.TWO} style={{ maxWidth: 520 }}>
        <Callout intent="success" title="Order Created" icon="tick-circle">
          <p><strong>Order ID:</strong> {order.id}</p>
          <p><strong>Total:</strong> {order.total} USDC</p>
          <p><strong>Deposit Address:</strong></p>
          <code style={{ wordBreak: 'break-all' }}>{order.depositAddress}</code>
          <p style={{ marginTop: 12 }}>
            Send exactly <strong>{order.total} USDC</strong> on Polygon to the address above.
          </p>
        </Callout>
        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <Button intent="primary" text="Track Order" onClick={() => navigate(`/orders/${order.id}`)} />
          <Button minimal text="Back to Products" onClick={() => navigate('/')} />
        </div>
      </Card>
    )
  }

  return (
    <>
      <h2>Checkout: {product.name}</h2>
      <Card elevation={Elevation.TWO} style={{ maxWidth: 420 }}>
        <p style={{ fontSize: 18 }}>
          Price: <strong>{product.price} {product.currency}</strong>
        </p>

        {error && <Callout intent="danger" style={{ marginBottom: 12 }}>{error}</Callout>}

        <FormGroup label="Quantity">
          <NumericInput
            min={1}
            value={quantity}
            onValueChange={(v) => setQuantity(Math.max(1, v))}
            fill
          />
        </FormGroup>

        <FormGroup label="Your Wallet Address" helperText="Polygon wallet that will send USDC">
          <InputGroup
            placeholder="0x..."
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            fill
          />
        </FormGroup>

        <p style={{ fontWeight: 600, fontSize: 16 }}>
          Total: {(product.price * quantity).toFixed(4)} USDC
        </p>

        <Button
          intent="primary"
          text="Place Order"
          loading={submitting}
          disabled={!wallet.trim()}
          onClick={handleSubmit}
          large
          fill
        />
      </Card>
    </>
  )
}
