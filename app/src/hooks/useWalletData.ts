import { useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'

export function useWalletData(walletId: string | null) {
  const [wallet, setWallet] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!walletId) return
    setLoading(true)
    try {
      const [walletData, txData, statsData] = await Promise.all([
        api.wallets.get(walletId),
        api.transactions.list(walletId),
        api.transactions.stats(walletId)
      ])
      setWallet(walletData)
      setTransactions(txData.transactions)
      setStats(statsData)
    } catch (err) {
      console.error('Failed to fetch wallet data:', err)
    } finally {
      setLoading(false)
    }
  }, [walletId])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 10000)
    return () => clearInterval(interval)
  }, [refresh])

  return { wallet, transactions, stats, loading, refresh }
}
