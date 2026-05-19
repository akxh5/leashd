import { Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'
import { AuthRequest } from './authMiddleware'

const PLAN_WALLET_LIMITS = {
  free: 1,
  starter: 5,
  pro: 25,
  enterprise: 999
}

export async function planMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        _count: { select: { wallets: true } }
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const limit = PLAN_WALLET_LIMITS[user.plan as keyof typeof PLAN_WALLET_LIMITS]
    const current = user._count.wallets

    if (current >= limit) {
      return res.status(403).json({
        error: 'Wallet limit reached for your plan',
        current,
        limit,
        plan: user.plan,
        upgrade: 'https://leashd.xyz/pricing'
      })
    }

    next()
  } catch (error) {
    return res.status(500).json({ error: 'Plan check failed' })
  }
}
