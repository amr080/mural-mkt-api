import { HTMLTable } from '@blueprintjs/core'
import { Link } from 'react-router-dom'
import type { Order } from '../types'
import StatusTag from './StatusTag'

export default function OrderTable({ orders }: { orders: Order[] }) {
  if (!orders.length) return <p>No orders yet.</p>

  return (
    <HTMLTable striped bordered style={{ width: '100%' }}>
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Product</th>
          <th>Qty</th>
          <th>Total</th>
          <th>Status</th>
          <th>Created</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((o) => (
          <tr key={o.id}>
            <td><Link to={`/orders/${o.id}`}>{o.id.slice(0, 12)}...</Link></td>
            <td>{o.productId}</td>
            <td>{o.quantity}</td>
            <td>{o.total} USDC</td>
            <td><StatusTag status={o.status} /></td>
            <td>{new Date(o.createdAt).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </HTMLTable>
  )
}
