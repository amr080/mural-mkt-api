import { useEffect, useState } from 'react'
import { Spinner, NonIdealState, Callout, HTMLTable, Tabs, Tab } from '@blueprintjs/core'
import { api } from '../api/client'
import type { Order } from '../types'
import OrderTable from '../components/OrderTable'

export default function Merchant() {
  const [orders, setOrders] = useState<Order[]>([])
  const [payouts, setPayouts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([api.getOrders(), api.getPayouts().catch(() => [])])
      .then(([o, p]) => { setOrders(o); setPayouts(p) })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />
  if (error) return <NonIdealState icon="error" title="Failed to load" description={error} />

  return (
    <>
      <h2>Merchant Dashboard</h2>
      <Tabs id="merchant-tabs" defaultSelectedTabId="orders">
        <Tab id="orders" title={`Orders (${orders.length})`} panel={<OrderTable orders={orders} />} />
        <Tab id="payouts" title={`Payouts (${payouts.length})`} panel={<PayoutsPanel payouts={payouts} />} />
      </Tabs>
    </>
  )
}

function PayoutsPanel({ payouts }: { payouts: any[] }) {
  if (!payouts.length) {
    return <Callout icon="info-sign">No payouts recorded yet.</Callout>
  }

  return (
    <HTMLTable striped bordered style={{ width: '100%' }}>
      <thead>
        <tr>
          <th>ID</th>
          <th>Status</th>
          <th>Amount</th>
          <th>Currency</th>
        </tr>
      </thead>
      <tbody>
        {payouts.map((p: any, i: number) => (
          <tr key={p.id || i}>
            <td>{p.id || '-'}</td>
            <td>{p.status || '-'}</td>
            <td>{p.amount ?? '-'}</td>
            <td>{p.currency || '-'}</td>
          </tr>
        ))}
      </tbody>
    </HTMLTable>
  )
}
