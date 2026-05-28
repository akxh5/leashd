import { BN } from "@coral-xyz/anchor";
import { Keypair, PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { api } from './lib/api';

export interface AgentResult {
  signature: string;
  recipient: string;
  amount: number;
  success: boolean;
  error?: string;
  timestamp: Date;
}

// Get or create agent keypair for this session
function getAgentKeypair(): Keypair {
  const stored = sessionStorage.getItem('leashd_agent_key');
  if (stored) {
    try {
      return Keypair.fromSecretKey(
        Uint8Array.from(JSON.parse(stored))
      );
    } catch (e) {
      sessionStorage.removeItem('leashd_agent_key');
    }
  }
  const keypair = Keypair.generate();
  sessionStorage.setItem(
    'leashd_agent_key',
    JSON.stringify(Array.from(keypair.secretKey))
  );
  return keypair;
}

export function getAgentPublicKey(): PublicKey {
  return getAgentKeypair().publicKey;
}

export function startAgent(
  program: any,
  ownerPubkey: PublicKey,
  walletConfigPDA: PublicKey,
  recipients: PublicKey[],
  onResult: (result: AgentResult) => void,
  walletDbId?: string
): () => void {
  const agentKeypair = getAgentKeypair();

  const intervalId = setInterval(async () => {
    if (recipients.length === 0) return;
    
    const recipient = recipients[Math.floor(Math.random() * recipients.length)] || PublicKey.default;
    const solAmount = Math.random() * (0.12 - 0.01) + 0.01;
    const lamports = Math.floor(solAmount * LAMPORTS_PER_SOL);

    try {
      const sig = await program.methods
        .executeTransfer(new BN(lamports))
        .accounts({
          agent: agentKeypair.publicKey,
          owner: ownerPubkey,
          walletConfig: walletConfigPDA,
          recipient,
          systemProgram: SystemProgram.programId,
        })
        .signers([agentKeypair])
        .rpc();

      onResult({
        success: true,
        amount: solAmount,
        recipient: recipient.toBase58(),
        signature: sig as string,
        timestamp: new Date()
      });

    } catch (err: any) {
      const errorMsg = err?.message || 'Unknown error';
      const blockReason = extractBlockReason(errorMsg);

      onResult({
        success: false,
        amount: solAmount,
        recipient: recipient.toBase58(),
        error: blockReason,
        signature: "",
        timestamp: new Date()
      });

      // Record blocked tx in backend if wallet ID is provided
      if (walletDbId) {
        api.transactions.recordBlocked({
          walletId: walletDbId,
          recipient: recipient.toBase58(),
          amount: lamports,
          blockReason,
          agentPubkey: agentKeypair.publicKey.toBase58()
        }).catch(() => {});
      }
    }
  }, 5000);

  return () => clearInterval(intervalId);
}

function extractBlockReason(msg: string): string {
  if (msg.includes('WalletFrozen')) return 'WalletFrozen';
  if (msg.includes('ExceedsTransactionLimit')) return 'ExceedsTransactionLimit';
  if (msg.includes('RecipientNotAllowed')) return 'RecipientNotAllowed';
  if (msg.includes('CooldownNotElapsed')) return 'CooldownNotElapsed';
  if (msg.includes('ExceedsDailyLimit')) return 'ExceedsDailyLimit';
  if (msg.includes('insufficient funds')) return 'InsufficientFunds';
  return 'TransactionFailed';
}
