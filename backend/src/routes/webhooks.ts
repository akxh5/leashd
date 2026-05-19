import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { 
  HeliusTransaction, 
  extractTransferFromHelius,
  LEASHD_PROGRAM_ID
} from '../lib/helius'
import { sendAlertEmail, buildFreezeAlertEmail, buildDailyLimitAlertEmail } from '../lib/resend'

const router = Router()

router.get('/health', (req, res) => {
  res.json({ route: 'webhooks', status: 'ok' })
})

// POST /api/webhooks/helius
// Receives transaction events from Helius
router.post('/helius', async (req: Request, res: Response) => {
  try {
    // Verify webhook secret
    const secret = req.headers['authorization']
    if (secret !== `Bearer ${process.env.HELIUS_WEBHOOK_SECRET}`) {
      return res.status(401).json({ error: 'Unauthorized webhook' })
    }

    const transactions: HeliusTransaction[] = Array.isArray(req.body) 
      ? req.body 
      : [req.body]

    for (const tx of transactions) {
      await processHeliusTransaction(tx)
    }

    return res.status(200).json({ processed: transactions.length })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return res.status(500).json({ error: 'Webhook processing failed' })
  }
})

async function processHeliusTransaction(tx: HeliusTransaction) {
  // Only process transactions involving our program
  const involvesProgram = tx.instructions?.some(
    ix => ix.programId === LEASHD_PROGRAM_ID
  )
  if (!involvesProgram) return

  const transfer = extractTransferFromHelius(tx)
  if (!transfer) return

  // Find wallet by PDA address
  const wallet = await prisma.wallet.findUnique({
    where: { pdaAddress: transfer.fromAccount },
    include: { 
      policy: true,
      alerts: { where: { isActive: true } },
      user: true
    }
  })

  if (!wallet) return

  // Record transaction
  const transaction = await prisma.transaction.create({
    data: {
      walletId: wallet.id,
      signature: transfer.signature,
      agentPubkey: wallet.agentPubkey,
      recipient: transfer.toAccount,
      amount: BigInt(transfer.amount),
      status: 'success',
      timestamp: transfer.timestamp,
      slot: BigInt(transfer.slot)
    }
  })

  // Update policy spent amount
  if (wallet.policy) {
    // Note: This is a simplified estimation for the demo.
    // In production, we'd fetch the on-chain state or precisely track the window.
    const newSpent = Number(wallet.policy.dailyLimit) // Placeholder logic from prompt
    const dailyLimit = Number(wallet.policy.dailyLimit)
    const percentage = Math.round((newSpent / dailyLimit) * 100)

    // Check 80% alert
    if (percentage >= 80 && percentage < 100) {
      await triggerAlerts(
        wallet.alerts,
        wallet.user.email,
        'daily_limit_80',
        buildDailyLimitAlertEmail(
          wallet.name,
          newSpent,
          dailyLimit,
          80
        ),
        `⚠️ ${wallet.name}: 80% of daily limit reached`
      )
    }

    // Check 100% alert
    if (percentage >= 100) {
      await triggerAlerts(
        wallet.alerts,
        wallet.user.email,
        'daily_limit_100',
        buildDailyLimitAlertEmail(
          wallet.name,
          newSpent,
          dailyLimit,
          100
        ),
        `🚨 ${wallet.name}: Daily limit reached`
      )
    }
  }

  console.log(`Processed tx: ${transfer.signature} for wallet ${wallet.name}`)
}

async function triggerAlerts(
  alerts: any[],
  userEmail: string,
  alertType: string,
  emailHtml: string,
  subject: string
) {
  for (const alert of alerts) {
    if (alert.type !== alertType) continue

    if (alert.channel === 'email') {
      await sendAlertEmail(
        alert.destination || userEmail,
        subject,
        emailHtml
      )
    }

    if (alert.channel === 'webhook') {
      try {
        await fetch(alert.destination, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: alertType, subject })
        })
      } catch (err) {
        console.error('Webhook alert failed:', err)
      }
    }
  }
}

export default router
