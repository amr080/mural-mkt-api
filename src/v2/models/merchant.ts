export interface Merchant {
  id: string
  name: string
  autoConvert: boolean
  fiatRail: string
  bankDetails: Record<string, any>
  recipientInfo: Record<string, any>
  muralAccountId: string
  depositAddress: string
  createdAt: string
}

const merchants = new Map<string, Merchant>()

export const merchantModel = {
  findAll: (): Merchant[] => Array.from(merchants.values()),

  findById: (id: string): Merchant | undefined => merchants.get(id),

  create: (merchant: Merchant): Merchant => {
    merchants.set(merchant.id, merchant)
    return merchant
  },

  update: (id: string, updates: Partial<Merchant>): Merchant | undefined => {
    const merchant = merchants.get(id)
    if (!merchant) return undefined
    const updated = { ...merchant, ...updates }
    merchants.set(id, updated)
    return updated
  },
}
