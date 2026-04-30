import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair, LAMPORTS_PER_SOL, SystemProgram } from "@solana/web3.js";
import { IDL } from "./target/types/agent_wallet"; // Assuming anchor generated types

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const programId = new PublicKey("HzUhxgap8Jr8wSq8Q8jQBPxFAgXYSbbp3XC6uuGN3qbR");
  const program = new Program(IDL as any, provider);

  const owner = provider.wallet.publicKey;
  const [configPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("wallet_config"), owner.toBuffer()],
    programId
  );

  console.log("Config PDA:", configPda.toBase58());

  const recipient = Keypair.generate().publicKey;
  console.log("Recipient:", recipient.toBase58());

  // 1. Add recipient to allowlist first (via owner)
  console.log("Adding recipient to allowlist...");
  await program.methods
    .updatePolicy({
      maxTxAmount: null,
      dailyLimit: null,
      windowDuration: null,
      cooldownSeconds: null,
      allowlist: [recipient],
    })
    .rpc();

  // 2. Attempt a valid transfer
  console.log("Attempting valid transfer (0.01 SOL)...");
  try {
    const tx = await program.methods
      .executeTransfer(new anchor.BN(0.01 * LAMPORTS_PER_SOL))
      .accounts({
        agent: owner, // Using owner as agent for simplicity in sim
        owner: owner,
        walletConfig: configPda,
        recipient: recipient,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc();
    console.log("Valid transfer SUCCESS:", tx);
  } catch (err) {
    console.error("Valid transfer FAILED:", err);
  }

  // 3. Attempt an invalid transfer (exceeds limit set in App.tsx: 0.1 SOL)
  console.log("Attempting invalid transfer (0.2 SOL)...");
  try {
    await program.methods
      .executeTransfer(new anchor.BN(0.2 * LAMPORTS_PER_SOL))
      .accounts({
        agent: owner,
        owner: owner,
        walletConfig: configPda,
        recipient: recipient,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc();
    console.log("Invalid transfer SUCCESS (Wait, it should have failed!)");
  } catch (err: any) {
    console.log("Invalid transfer FAILED as expected:", err.message);
  }
}

main();
