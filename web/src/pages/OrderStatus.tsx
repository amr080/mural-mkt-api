import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, Elevation, Spinner, NonIdealState, Callout } from '@blueprintjs/core'
import { api } from '../api/client'
import type { Order } from '../types'
import StatusTag from '../components/StatusTag'

const POLL_INTERVAL = 5000

export default function OrderStatus() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let active = true

    const poll = async () => {
      try {
        const o = await api.getOrder(id)
        if (active) setOrder(o)
      } catch (e: any) {
        if (active) setError(e.message)
      } finally {
        if (active) setLoading(false)
      }
    }

    poll()
    const interval = setInterval(poll, POLL_INTERVAL)
    return () => { active = false; clearInterval(interval) }
  }, [id])

  if (loading) return <Spinner />
  if (error || !order) return <NonIdealState icon="error" title="Order not found" description={error || undefined} />

  return (
    <>
      <h2>Order {order.id}</h2>
      <Card elevation={Elevation.TWO} style={{ maxWidth: 560 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <Row label="Status"><StatusTag status={order.status} /></Row>
            <Row label="Product">{order.productId}</Row>
            <Row label="Quantity">{order.quantity}</Row>
            <Row label="Total">{order.total} USDC</Row>
            <Row label="Wallet"><code style={{ wordBreak: 'break-all' }}>{order.customerWallet}</code></Row>
            <Row label="Created">{new Date(order.createdAt).toLocaleString()}</Row>
            {order.txHash && <Row label="Tx Hash"><code style={{ wordBreak: 'break-all' }}>{order.txHash}</code></Row>}
            {order.paidAt && <Row label="Paid At">{new Date(order.paidAt).toLocaleString()}</Row>}
            {order.payoutId && <Row label="Payout ID">{order.payoutId}</Row>}
          </tbody>
        </table>

        {order.status === 'pending' && (
          <Callout intent="warning" icon="time" title="Awaiting Payment" style={{ marginTop: 16 }}>
            <p>Send exactly <strong>{order.total} USDC</strong> on Polygon to:</p>
            <code style={{ wordBreak: 'break-all', display: 'block', padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
              {order.depositAddress}
            </code>
            <p style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              This page auto-refreshes every {POLL_INTERVAL / 1000}s.
            </p>
          </Callout>
        )}

        {order.status === 'paid' && (
          <Callout intent="success" icon="tick-circle" title="Payment Confirmed" style={{ marginTop: 16 }}>
            Payment received. USDC-to-COP conversion initiated.
          </Callout>
        )}
      </Card>

      <p style={{ marginTop: 16 }}>
        <Link to="/">Back to Products</Link>
      </p>
    </>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr>
      <td style={{ padding: '6px 12px 6px 0', fontWeight: 600, whiteSpace: 'nowrap', verticalAlign: 'top' }}>{label}</td>
      <td style={{ padding: '6px 0' }}>{children}</td>
    </tr>
  )
}
