import { ENV } from './config'
import { MuralAccount, MuralWebhook, MuralTransaction, Paginated } from './types'

async function request<T>(
  method: string,
  path: string,
  body?: any,
  extraHeaders?: Record<string, string>
): Promise<T> {
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${ENV.MURAL_API_KEY}`,
    ...extraHeaders,
  }
  if (method !== 'GET') headers['Content-Type'] = 'application/json'

  const url = `${ENV.MURAL_BASE_URL}${path}`
  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Mural ${method} ${path} → ${res.status}: ${text}`)
  }

  const text = await res.text()
  return text ? (JSON.parse(text) as T) : ({} as T)
}

export const muralClient = {
  // Accounts (returns direct array)
  getAccounts: () =>
    request<MuralAccount[]>('GET', '/api/accounts'),

  getAccount: (id: string) =>
    request<MuralAccount>('GET', `/api/accounts/${id}`),

  createAccount: (name: string) =>
    request<MuralAccount>('POST', '/api/accounts', { name }),

  // Webhooks
  createWebhook: (url: string, categories: string[]) =>
    request<MuralWebhook>('POST', '/api/webhooks', { url, categories }),

  updateWebhookStatus: (id: string, status: 'ACTIVE' | 'DISABLED') =>
    request<MuralWebhook>('PATCH', `/api/webhooks/${id}/status`, { status }),

  listWebhooks: () =>
    request<any>('GET', '/api/webhooks'),

  deleteWebhook: (id: string) =>
    fetch(`${ENV.MURAL_BASE_URL}/api/webhooks/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${ENV.MURAL_API_KEY}` },
    }),

  // Transactions
  searchTransactions: (accountId: string, limit = 10) =>
    request<Paginated<MuralTransaction>>(
      'POST',
      `/api/transactions/search/account/${accountId}?limit=${limit}`,
      {}
    ),

  getTransaction: (id: string) =>
    request<MuralTransaction>('GET', `/api/transactions/${id}`),

  // Payouts
  getBankDetails: (rail: string) =>
    request<any>('GET', `/api/payouts/bank-details?fiatCurrencyAndRail=${rail}`),

  getPayoutFees: (body: any) =>
    request<any>('POST', '/api/payouts/fees/token-to-fiat', body),

  createPayout: (body: any) =>
    request<any>('POST', '/api/payouts/payout', body),

  executePayout: (id: string) =>
    request<any>(
      'POST',
      `/api/payouts/payout/${id}/execute`,
      { exchangeRateToleranceMode: 'FLEXIBLE' },
      { 'transfer-api-key': ENV.MURAL_TRANSFER_API_KEY }
    ),

  getPayout: (id: string) =>
    request<any>('GET', `/api/payouts/payout/${id}`),

  searchPayouts: () =>
    request<any>('POST', '/api/payouts/search', {}),
}
