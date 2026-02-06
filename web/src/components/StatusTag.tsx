import { Tag, Intent } from '@blueprintjs/core'
import type { OrderStatus } from '../types'

const intentMap: Record<OrderStatus, Intent> = {
  pending: Intent.WARNING,
  paid: Intent.SUCCESS,
  expired: Intent.DANGER,
}

export default function StatusTag({ status }: { status: OrderStatus }) {
  return <Tag intent={intentMap[status]} minimal>{status}</Tag>
}
