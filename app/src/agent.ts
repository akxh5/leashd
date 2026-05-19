import { BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { api } from './lib/api';

export interface AgentResult {
  signature: string;
  recipient: string;
  amount: number;
  success: boolean;
  error?: string;
  timestamp: number;
}

export function startAgent(
  program: any,
  owner: PublicKey,
  walletConfigPDA: PublicKey,
  recipients: PublicKey[],
  onResult: (result: AgentResult) => void,
  walletDbId?: string // Optional DB ID for recording stats
) {
  const intervalId = setInterval(async () => {
    const amountSOL = Math.random() * (0.12 - 0.01) + 0.01;
    const amountLamports = new BN(Math.floor(amountSOL * LAMPORTS_PER_SOL));
    const recipient = recipients[Math.floor(Math.random() * recipients.length)] || PublicKey.default;
    const recipientAddress = recipient.toBase58();

    try {
      const signature = await program.methods
        .executeTransfer(amountLamports)
        .accounts({
          agent: owner,
          owner: owner,
          walletConfig: walletConfigPDA,
          recipient: recipient,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      onResult({
        success: true,
        amount: amountSOL,
        recipient: recipientAddress,
        signature: signature as string,
        timestamp: Date.now(),
      });
    } catch (err: any) {
      const errorMsg = err.message || 'Unknown error';
      
      onResult({
        success: false,
        amount: amountSOL,
        recipient: recipientAddress,
        error: errorMsg,
        signature: "",
        timestamp: Date.now(),
      });

      // Record blocked transaction in backend if wallet ID is provided
      if (walletDbId) {
        api.transactions.recordBlocked({
          walletId: walletDbId,
          recipient: recipientAddress,
          amount: Math.floor(amountSOL * LAMPORTS_PER_SOL), // Record in lamports
          blockReason: errorMsg,
          agentPubkey: owner.toBase58()
        }).catch(console.error);
      }
    }
  }, 5000);

  return () => clearInterval(intervalId);
}
