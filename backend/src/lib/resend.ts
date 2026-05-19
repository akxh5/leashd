import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendAlertEmail(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  try {
    await resend.emails.send({
      from: 'Leashd Alerts <alerts@leashd.xyz>',
      to,
      subject,
      html
    })
  } catch (error) {
    console.error('Failed to send alert email:', error)
  }
}

export function buildFreezeAlertEmail(
  walletName: string,
  pdaAddress: string,
  isFrozen: boolean
): string {
  return `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0D0D0D; color: #E4DDD3; padding: 32px; border-radius: 12px;">
      <h1 style="color: ${isFrozen ? '#FF4D4D' : '#00A19B'}; font-size: 24px;">
        ${isFrozen ? '🔴 Wallet Frozen' : '🟢 Wallet Unfrozen'}
      </h1>
      <p>Your agent wallet <strong>${walletName}</strong> has been ${isFrozen ? 'frozen' : 'unfrozen'}.</p>
      <p style="color: #7B61FF; font-family: monospace; font-size: 12px;">${pdaAddress}</p>
      <p>Log in to your Leashd dashboard to manage your wallet.</p>
      <a href="https://leashd.xyz/dashboard" 
         style="background: #00A19B; color: #0D0D0D; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
        Open Dashboard
      </a>
    </div>
  `
}

export function buildDailyLimitAlertEmail(
  walletName: string,
  spent: number,
  limit: number,
  percentage: number
): string {
  return `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0D0D0D; color: #E4DDD3; padding: 32px; border-radius: 12px;">
      <h1 style="color: #FF4D4D; font-size: 24px;">⚠️ Spending Alert</h1>
      <p>Your agent wallet <strong>${walletName}</strong> has used <strong>${percentage}%</strong> of its daily limit.</p>
      <div style="background: #1A1A1A; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 0;">Spent: <strong>${(spent / 1e9).toFixed(4)} SOL</strong></p>
        <p style="margin: 0;">Daily Limit: <strong>${(limit / 1e9).toFixed(4)} SOL</strong></p>
      </div>
      <a href="https://leashd.xyz/dashboard"
         style="background: #00A19B; color: #0D0D0D; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
        View Dashboard
      </a>
    </div>
  `
}
