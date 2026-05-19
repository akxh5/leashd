import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { verifyWalletSignature } from '../utils/verifyWalletSignature'
import { generateApiKey } from '../utils/generateApiKey'
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware'

const router = Router()

// Health check
router.get('/health', (req, res) => {
  res.json({ route: 'auth', status: 'ok' })
})

// POST /api/auth/register
// Register with email (developer signup)
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' })
    }

    const apiKey = generateApiKey()

    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        apiKey,
        plan: 'free'
      }
    })

    return res.status(201).json({
      id: user.id,
      email: user.email,
      name: user.name,
      apiKey: user.apiKey,
      plan: user.plan,
      createdAt: user.createdAt
    })
  } catch (error) {
    console.error('Registration error:', error)
    return res.status(500).json({ error: 'Registration failed' })
  }
})

// POST /api/auth/wallet-login
// Login or register with Solana wallet signature
router.post('/wallet-login', async (req: Request, res: Response) => {
  try {
    const { publicKey, signature, message } = req.body

    if (!publicKey || !signature || !message) {
      return res.status(400).json({ 
        error: 'publicKey, signature, and message are required' 
      })
    }

    // Verify the signature
    const isValid = verifyWalletSignature(message, signature, publicKey)
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid wallet signature' })
    }

    // Find or create user by wallet pubkey used as email
    const walletEmail = `${publicKey}@wallet.leashd.xyz`

    let user = await prisma.user.findUnique({ 
      where: { email: walletEmail } 
    })

    if (!user) {
      const apiKey = generateApiKey()
      user = await prisma.user.create({
        data: {
          email: walletEmail,
          name: `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`,
          apiKey,
          plan: 'free'
        }
      })
    }

    return res.status(200).json({
      id: user.id,
      email: user.email,
      name: user.name,
      apiKey: user.apiKey,
      plan: user.plan,
      publicKey,
      createdAt: user.createdAt
    })
  } catch (error) {
    console.error('Wallet login error:', error)
    return res.status(500).json({ error: 'Wallet login failed' })
  }
})

// GET /api/auth/me
// Get current user (requires auth)
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        subscriptions: {
          where: { status: 'active' },
          take: 1
        },
        _count: {
          select: { wallets: true }
        }
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    return res.status(200).json({
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      apiKey: user.apiKey,
      walletCount: user._count.wallets,
      subscription: user.subscriptions[0] || null,
      createdAt: user.createdAt
    })
  } catch (error) {
    console.error('Fetch user error:', error)
    return res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// POST /api/auth/regenerate-key
// Regenerate API key
router.post('/regenerate-key', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const newKey = generateApiKey()

    await prisma.user.update({
      where: { id: req.user!.id },
      data: { apiKey: newKey }
    })

    return res.status(200).json({ 
      apiKey: newKey,
      message: 'API key regenerated. Update your integrations.' 
    })
  } catch (error) {
    console.error('Regenerate key error:', error)
    return res.status(500).json({ error: 'Failed to regenerate key' })
  }
})

export default router
