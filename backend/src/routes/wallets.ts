import { Router, Response } from 'express'
import { prisma } from '../lib/prisma'
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware'
import { planMiddleware } from '../middleware/planMiddleware'
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js'

const router = Router()

// Health check
router.get('/health', (req, res) => {
  res.json({ route: 'wallets', status: 'ok' })
})

// GET /api/wallets
// List all wallets for authenticated user
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const wallets = await prisma.wallet.findMany({
      where: { userId: req.user!.id, isActive: true },
      include: {
        policy: true,
        _count: { select: { transactions: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return res.status(200).json(serializeWallet(wallets))
  } catch (error) {
    console.error('Fetch wallets error:', error)
    return res.status(500).json({ error: 'Failed to fetch wallets' })
  }
})

// POST /api/wallets
// Register a new agent wallet
// Requires auth + plan limit check
router.post('/', authMiddleware, planMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      pdaAddress,
      ownerPubkey,
      agentPubkey,
      cluster,
      policy
    } = req.body

    // Validate required fields
    if (!name || !pdaAddress || !ownerPubkey || !agentPubkey) {
      return res.status(400).json({
        error: 'name, pdaAddress, ownerPubkey, agentPubkey are required'
      })
    }

    // Validate pubkeys are valid base58
    try {
      new PublicKey(pdaAddress)
      new PublicKey(ownerPubkey)
      new PublicKey(agentPubkey)
    } catch {
      return res.status(400).json({ error: 'Invalid Solana public key format' })
    }

    // Check pdaAddress not already registered
    const existing = await prisma.wallet.findUnique({
      where: { pdaAddress }
    })
    if (existing) {
      return res.status(409).json({ error: 'Wallet PDA already registered' })
    }

    // Create wallet with optional policy
    const wallet = await prisma.wallet.create({
      data: {
        userId: req.user!.id,
        name,
        pdaAddress,
        ownerPubkey,
        agentPubkey,
        cluster: cluster || 'devnet',
        ...(policy && {
          policy: {
            create: {
              maxTxAmount: BigInt(policy.maxTxAmount),
              dailyLimit: BigInt(policy.dailyLimit),
              cooldownSecs: policy.cooldownSecs,
              windowDuration: policy.windowDuration || 86400,
              isFrozen: false,
              allowlist: policy.allowlist || []
            }
          }
        })
      },
      include: { policy: true }
    })

    // Serialize BigInt for JSON
    return res.status(201).json(serializeWallet(wallet))
  } catch (error) {
    console.error('Create wallet error:', error)
    return res.status(500).json({ error: 'Failed to create wallet' })
  }
})

// GET /api/wallets/:id
// Get single wallet with full details
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const wallet = await prisma.wallet.findFirst({
      where: {
        id: id as string,
        userId: req.user!.id
      },
      include: {
        policy: true,
        transactions: {
          orderBy: { timestamp: 'desc' },
          take: 20
        },
        alerts: true,
        _count: { select: { transactions: true } }
      }
    })

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' })
    }

    return res.status(200).json(serializeWallet(wallet))
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch wallet' })
  }
})

// PATCH /api/wallets/:id
// Update wallet name or policy
router.patch('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, policy } = req.body
    const { id } = req.params

    const wallet = await prisma.wallet.findFirst({
      where: { id: id as string, userId: req.user!.id }
    })

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' })
    }

    const updated = await prisma.wallet.update({
      where: { id: id as string },
      data: {
        ...(name && { name }),
        ...(policy && {
          policy: {
            upsert: {
              create: {
                maxTxAmount: BigInt(policy.maxTxAmount),
                dailyLimit: BigInt(policy.dailyLimit),
                cooldownSecs: policy.cooldownSecs,
                windowDuration: policy.windowDuration || 86400,
                isFrozen: policy.isFrozen ?? false,
                allowlist: policy.allowlist || []
              },
              update: {
                ...(policy.maxTxAmount && { maxTxAmount: BigInt(policy.maxTxAmount) }),
                ...(policy.dailyLimit && { dailyLimit: BigInt(policy.dailyLimit) }),
                ...(policy.cooldownSecs !== undefined && { cooldownSecs: policy.cooldownSecs }),
                ...(policy.windowDuration && { windowDuration: policy.windowDuration }),
                ...(policy.isFrozen !== undefined && { isFrozen: policy.isFrozen }),
                ...(policy.allowlist && { allowlist: policy.allowlist })
              }
            }
          }
        })
      },
      include: { policy: true }
    })

    return res.status(200).json(serializeWallet(updated))
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update wallet' })
  }
})

// DELETE /api/wallets/:id
// Soft delete wallet
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const wallet = await prisma.wallet.findFirst({
      where: { id: id as string, userId: req.user!.id }
    })

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' })
    }

    await prisma.wallet.update({
      where: { id: id as string },
      data: { isActive: false }
    })

    return res.status(200).json({ message: 'Wallet deactivated' })
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete wallet' })
  }
})

// GET /api/wallets/:id/balance
// Fetch live SOL balance from chain
router.get('/:id/balance', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const wallet = await prisma.wallet.findFirst({
      where: { id: id as string, userId: req.user!.id }
    })

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' })
    }

    const connection = new Connection(
      clusterApiUrl(wallet.cluster as 'devnet' | 'mainnet-beta'),
      'confirmed'
    )

    const pubkey = new PublicKey(wallet.pdaAddress)
    const lamports = await connection.getBalance(pubkey)

    return res.status(200).json({
      pdaAddress: wallet.pdaAddress,
      lamports,
      sol: lamports / 1_000_000_000,
      cluster: wallet.cluster
    })
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch balance' })
  }
})

// Helper: serialize BigInt fields for JSON
function serializeWallet(wallet: any): any {
  return JSON.parse(JSON.stringify(wallet, (_, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ))
}

export default router
