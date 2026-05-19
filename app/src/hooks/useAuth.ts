import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { api, setApiKey, getApiKey, clearApiKey } from '../lib/api'
import bs58 from 'bs58'

export interface AuthUser {
  id: string
  email: string
  name: string
  plan: string
  apiKey: string
  walletCount: number
}

export function useAuth() {
  const { publicKey, signMessage, disconnect } = useWallet()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // On wallet connect, attempt login
  useEffect(() => {
    if (!publicKey) {
      setUser(null)
      return
    }

    // Check if we have a stored API key
    const storedKey = getApiKey()
    if (storedKey) {
      api.auth.me()
        .then(setUser)
        .catch(() => {
          clearApiKey()
          loginWithWallet()
        })
    } else {
      loginWithWallet()
    }
  }, [publicKey])

  async function loginWithWallet() {
    if (!publicKey || !signMessage) return
    setLoading(true)
    setError(null)

    try {
      const nonce = Math.random().toString(36).substring(7)
      const message = `Sign in to Leashd\nNonce: ${nonce}\nTimestamp: ${Date.now()}`
      const messageBytes = new TextEncoder().encode(message)
      const signatureBytes = await signMessage(messageBytes)
      const signature = bs58.encode(signatureBytes)

      const result = await api.auth.walletLogin(
        publicKey.toBase58(),
        signature,
        message
      )

      setApiKey(result.apiKey)
      setUser(result)
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    clearApiKey()
    setUser(null)
    disconnect()
  }

  return { user, loading, error, logout, loginWithWallet }
}
