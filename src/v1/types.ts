// ---- App Types ----

export type OrderStatus = 'pending' | 'paid' | 'expired'

export interface Product {
  id: string
  name: string
  price: number
  currency: 'USDC'
}

export interface Order {
  id: string
  productId: string
  quantity: number
  total: number
  status: OrderStatus
  customerWallet: string
  depositAddress: string
  createdAt: string
  txHash?: string
  paidAt?: string
  payoutId?: string
}

// ---- Mural API Types ----

export interface Paginated<T> {
  total: number
  nextId?: string
  results: T[]
}

export interface MuralTokenAmount {
  tokenAmount: number
  tokenSymbol: string
}

export interface MuralWalletDetails {
  blockchain: string
  walletAddress: string
}

export interface MuralAccountDetails {
  walletDetails: MuralWalletDetails
  balances: MuralTokenAmount[]
  payinMethods: any[]
}

export interface MuralAccount {
  id: string
  name: string
  status: 'INITIALIZING' | 'ACTIVE'
  isApiEnabled: boolean
  createdAt: string
  updatedAt: string
  accountDetails?: MuralAccountDetails
  destinationToken: { symbol: string; blockchain: string }
}

export interface MuralWebhook {
  id: string
  version: number
  url: string
  publicKey: string
  categories: string[]
  status: 'DISABLED' | 'ACTIVE'
  createdAt: string
  updatedAt: string
}

export interface MuralTransaction {
  id: string
  hash: string
  transactionExecutionDate: string
  blockchain: string
  amount: MuralTokenAmount
  accountId: string
  counterpartyInfo: any
  transactionDetails: any
}

export interface AccountCreditedPayload {
  type: 'account_credited'
  accountId: string
  organizationId: string
  transactionId: string
  accountWalletAddress: string
  tokenAmount: {
    blockchain: string
    tokenAmount: number
    tokenSymbol: string
    tokenContractAddress: string
  }
  transactionDetails: {
    blockchain: string
    transactionDate: string
    transactionHash: string
    sourceWalletAddress: string
    destinationWalletAddress: string
  }
}

export interface MuralWebhookEvent {
  eventId: string
  deliveryId: string
  attemptNumber: number
  eventCategory: string
  occurredAt: string
  payload: AccountCreditedPayload
}
