export const LEASHD_PROGRAM_ID = 
  'AUjm6x5oYEmzkFg933h8oe2fZU7JKZi4YvhzL2UmPwSb'

export interface HeliusTransaction {
  signature: string
  slot: number
  timestamp: number
  type: string
  source: string
  accountData: Array<{
    account: string
    nativeBalanceChange: number
  }>
  events: {
    compressed?: any[]
    nft?: any
  }
  instructions: Array<{
    programId: string
    data: string
    accounts: string[]
    innerInstructions: any[]
  }>
  nativeTransfers?: Array<{
    fromUserAccount: string
    toUserAccount: string
    amount: number
  }>
}

export function extractTransferFromHelius(tx: HeliusTransaction) {
  try {
    const transfer = tx.nativeTransfers?.[0]
    if (!transfer) return null

    return {
      signature: tx.signature,
      fromAccount: transfer.fromUserAccount,
      toAccount: transfer.toUserAccount,
      amount: transfer.amount,
      timestamp: new Date(tx.timestamp * 1000),
      slot: tx.slot
    }
  } catch {
    return null
  }
}
