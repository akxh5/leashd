import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, LAMPORTS_PER_SOL, SystemProgram, Keypair } from "@solana/web3.js";
import { expect } from "chai";
import { AgentWallet } from "../target/types/agent_wallet";

describe("agent-wallet", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AgentWallet as Program<AgentWallet>;
  const owner = provider.wallet.publicKey;

  const [walletConfigPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("wallet_config"), owner.toBuffer()],
    program.programId
  );

  it("Initializes the wallet", async () => {
    const agent = Keypair.generate().publicKey;
    const maxTxAmount = new anchor.BN(0.1 * LAMPORTS_PER_SOL);
    const dailyLimit = new anchor.BN(0.5 * LAMPORTS_PER_SOL);

    await program.methods
      .initializeWallet({
        agent,
        maxTxAmount,
        dailyLimit,
        windowDuration: new anchor.BN(24 * 60 * 60),
        cooldownSeconds: new anchor.BN(0),
        allowlist: [],
      })
      .accounts({
        owner,
        walletConfig: walletConfigPda,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc();

    const config = await program.account.walletConfig.fetch(walletConfigPda);
    expect(config.owner.toBase58()).to.equal(owner.toBase58());
    expect(config.agent.toBase58()).to.equal(agent.toBase58());
    expect(config.maxTxAmount.toString()).to.equal(maxTxAmount.toString());
  });

  it("Executes a transfer within limits", async () => {
    const recipient = Keypair.generate().publicKey;
    
    // Fund the PDA first
    const tx = new anchor.web3.Transaction().add(
      SystemProgram.transfer({
        fromPubkey: owner,
        toPubkey: walletConfigPda,
        lamports: 1 * LAMPORTS_PER_SOL,
      })
    );
    await provider.sendAndConfirm(tx);

    // Add to allowlist
    await program.methods
      .updatePolicy({
        maxTxAmount: null,
        dailyLimit: null,
        windowDuration: null,
        cooldownSeconds: null,
        allowlist: [recipient],
      })
      .accounts({
        owner,
        walletConfig: walletConfigPda,
      } as any)
      .rpc();

    // The current agent in state is the one generated in previous test.
    // To make this test pass easily, we'll update agent to be the owner (provider wallet).
    await program.methods.setAgent(owner).accounts({
      owner,
      walletConfig: walletConfigPda,
    } as any).rpc();

    const amount = new anchor.BN(0.05 * LAMPORTS_PER_SOL);
    await program.methods
      .executeTransfer(amount)
      .accounts({
        agent: owner,
        owner,
        walletConfig: walletConfigPda,
        recipient,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc();

    const bal = await provider.connection.getBalance(recipient);
    expect(bal).to.equal(amount.toNumber());
  });

  it("Fails when transfer exceeds limit", async () => {
    const recipient = Keypair.generate().publicKey;
    
    // Add to allowlist
    await program.methods
      .updatePolicy({
        maxTxAmount: null,
        dailyLimit: null,
        windowDuration: null,
        cooldownSeconds: null,
        allowlist: [recipient],
      })
      .accounts({
        owner,
        walletConfig: walletConfigPda,
      } as any)
      .rpc();

    const amount = new anchor.BN(0.2 * LAMPORTS_PER_SOL); // Max is 0.1
    try {
      await program.methods
        .executeTransfer(amount)
        .accounts({
          agent: owner,
          owner,
          walletConfig: walletConfigPda,
          recipient,
          systemProgram: SystemProgram.programId,
        } as any)
        .rpc();
      expect.fail("Should have failed");
    } catch (err: any) {
      // Anchor error for ExceedsTransactionLimit
      expect(err.message).to.include("ExceedsTransactionLimit");
    }
  });
});
