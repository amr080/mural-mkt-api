export interface CreateOrderDTO {
  productId: string
  quantity: number
  customerWallet: string
  tokenSymbol: string
  merchantId: string
}

export interface CreateMerchantDTO {
  name: string
  autoConvert: boolean
  fiatRail: string
  bankDetails: Record<string, any>
  recipientInfo: Record<string, any>
  muralAccountId: string
  depositAddress: string
}

export interface UpdateMerchantDTO {
  autoConvert?: boolean
  fiatRail?: string
  bankDetails?: Record<string, any>
  recipientInfo?: Record<string, any>
}

const requiredFields = (obj: Record<string, any>, fields: string[]): string | null => {
  for (const f of fields) {
    if (obj[f] === undefined || obj[f] === null || obj[f] === '') {
      return `Missing required field: ${f}`
    }
  }
  return null
}

export function validateCreateOrder(body: any): { error?: string; data?: CreateOrderDTO } {
  const err = requiredFields(body, ['productId', 'quantity', 'customerWallet', 'tokenSymbol', 'merchantId'])
  if (err) return { error: err }
  if (typeof body.quantity !== 'number' || body.quantity <= 0) return { error: 'quantity must be a positive number' }
  return { data: body as CreateOrderDTO }
}

export function validateCreateMerchant(body: any): { error?: string; data?: CreateMerchantDTO } {
  const err = requiredFields(body, ['name', 'muralAccountId', 'depositAddress'])
  if (err) return { error: err }
  return {
    data: {
      name: body.name,
      autoConvert: body.autoConvert ?? false,
      fiatRail: body.fiatRail ?? '',
      bankDetails: body.bankDetails ?? {},
      recipientInfo: body.recipientInfo ?? {},
      muralAccountId: body.muralAccountId,
      depositAddress: body.depositAddress,
    },
  }
}

export function validateUpdateMerchant(body: any): { error?: string; data?: UpdateMerchantDTO } {
  if (Object.keys(body).length === 0) return { error: 'No fields to update' }
  const allowed = ['autoConvert', 'fiatRail', 'bankDetails', 'recipientInfo']
  const data: Record<string, any> = {}
  for (const key of allowed) {
    if (body[key] !== undefined) data[key] = body[key]
  }
  if (Object.keys(data).length === 0) return { error: 'No valid fields to update' }
  return { data: data as UpdateMerchantDTO }
}
