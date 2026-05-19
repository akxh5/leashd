import { Router, Response } from 'express'
import { prisma } from '../lib/prisma'
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware'

const router = Router()

router.get('/health', (req, res) => {
  res.json({ route: 'transactions', status: 'ok' })
})

// GET /api/transactions/:walletId
// Get paginated transactions for a wallet
router.get('/:walletId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { walletId } = req.params
    const { page = '1', limit = '20', status } = req.query

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    // Verify wallet belongs to user
    const wallet = await prisma.wallet.findFirst({
      where: { id: walletId as string, userId: req.user!.id }
    })

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' })
    }

    const where = {
      walletId: walletId as string,
      ...(status && { status: status as any })
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.transaction.count({ where })
    ])

    // Serialize BigInt
    const serialized = JSON.parse(
      JSON.stringify(transactions, (_, v) =>
        typeof v === 'bigint' ? v.toString() : v
      )
    )

    return res.status(200).json({
      transactions: serialized,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    })
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch transactions' })
  }
})

// POST /api/transactions/record
// Manually record a blocked transaction (from frontend)
router.post('/record', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const {
      walletId,
      recipient,
      amount,
      blockReason,
      agentPubkey
    } = req.body

    const wallet = await prisma.wallet.findFirst({
      where: { id: walletId as string, userId: req.user!.id }
    })

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' })
    }

    const transaction = await prisma.transaction.create({
      data: {
        walletId,
        recipient,
        amount: BigInt(amount),
        status: 'blocked',
        blockReason,
        agentPubkey: agentPubkey || wallet.agentPubkey,
        timestamp: new Date()
      }
    })

    return res.status(201).json(
      JSON.parse(JSON.stringify(transaction, (_, v) =>
        typeof v === 'bigint' ? v.toString() : v
      ))
    )
  } catch (error) {
    return res.status(500).json({ error: 'Failed to record transaction' })
  }
})

// GET /api/transactions/:walletId/stats
// Spending stats for a wallet
router.get('/:walletId/stats', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { walletId } = req.params
    const wallet = await prisma.wallet.findFirst({
      where: { id: walletId as string, userId: req.user!.id },
      include: { policy: true }
    })

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' })
    }

    const [total, successful, blocked, totalVolume] = await Promise.all([
      prisma.transaction.count({ where: { walletId: wallet.id } }),
      prisma.transaction.count({ where: { walletId: wallet.id, status: 'success' } }),
      prisma.transaction.count({ where: { walletId: wallet.id, status: 'blocked' } }),
      prisma.transaction.aggregate({
        where: { walletId: wallet.id, status: 'success' },
        _sum: { amount: true }
      })
    ])

    return res.status(200).json({
      total,
      successful,
      blocked,
      blockRate: total > 0 ? Math.round((blocked / total) * 100) : 0,
      totalVolumeLamports: totalVolume._sum.amount?.toString() || '0',
      totalVolumeSOL: Number(totalVolume._sum.amount || 0) / 1e9
    })
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

export default router
