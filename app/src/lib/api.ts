const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Store API key in memory (set after wallet login)
let currentApiKey: string | null = null

export function setApiKey(key: string) {
  currentApiKey = key
  localStorage.setItem('leashd_api_key', key)
}

export function getApiKey(): string | null {
  if (currentApiKey) return currentApiKey
  return localStorage.getItem('leashd_api_key')
}

export function clearApiKey() {
  currentApiKey = null
  localStorage.removeItem('leashd_api_key')
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const apiKey = getApiKey()
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey && { 'x-api-key': apiKey }),
      ...options.headers
    }
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }

  return res.json()
}

// Auth
export const api = {
  auth: {
    register: (email: string, name: string) =>
      apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, name })
      }),

    walletLogin: (publicKey: string, signature: string, message: string) =>
      apiFetch('/api/auth/wallet-login', {
        method: 'POST',
        body: JSON.stringify({ publicKey, signature, message })
      }),

    me: () => apiFetch('/api/auth/me')
  },

  wallets: {
    list: () => apiFetch('/api/wallets'),

    create: (data: {
      name: string
      pdaAddress: string
      ownerPubkey: string
      agentPubkey: string
      cluster: string
      policy?: any
    }) => apiFetch('/api/wallets', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

    get: (id: string) => apiFetch(`/api/wallets/${id}`),

    update: (id: string, data: any) =>
      apiFetch(`/api/wallets/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      }),

    balance: (id: string) => apiFetch(`/api/wallets/${id}/balance`)
  },

  transactions: {
    list: (walletId: string, page = 1) =>
      apiFetch(`/api/transactions/${walletId}?page=${page}&limit=20`),

    stats: (walletId: string) =>
      apiFetch(`/api/transactions/${walletId}/stats`),

    recordBlocked: (data: {
      walletId: string
      recipient: string
      amount: number
      blockReason: string
      agentPubkey: string
    }) => apiFetch('/api/transactions/record', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
}
