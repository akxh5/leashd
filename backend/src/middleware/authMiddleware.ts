import { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    plan: string
    apiKey: string
  }
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const apiKey = req.headers['x-api-key'] as string
    const bearerToken = req.headers.authorization?.replace('Bearer ', '')

    const key = apiKey || bearerToken

    if (!key) {
      return res.status(401).json({ error: 'No API key provided' })
    }

    const user = await prisma.user.findUnique({
      where: { apiKey: key }
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid API key' })
    }

    req.user = {
      id: user.id,
      email: user.email,
      plan: user.plan,
      apiKey: user.apiKey
    }

    next()
  } catch (error) {
    return res.status(500).json({ error: 'Auth middleware failed' })
  }
}
