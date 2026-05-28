import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useProgram } from './hooks/useProgram';
import { WalletStatus } from './components/WalletStatus';
import { KillSwitch } from './components/KillSwitch';
import { PolicyConfig } from './components/PolicyConfig';
import { TransactionFeed, Transaction } from './components/TransactionFeed';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { DocsSection } from './components/DocsSection';
import { startAgent } from './agent';
import { ShieldAlert, Zap, AlertCircle, LayoutDashboard, Lock } from 'lucide-react';

function Dashboard() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const program = useProgram();

  const [isFrozen, setIsFrozen] = useState(false);
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [walletConfig, setWalletConfig] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [configPda, setConfigPda] = useState<PublicKey | null>(null);

  const isOwner = useMemo(() => {
    if (!publicKey || !walletConfig) return false;
    return publicKey.toBase58() === walletConfig.owner.toBase58();
  }, [publicKey, walletConfig]);

  const fetchState = useCallback(async () => {
    if (!publicKey || !program) return;

    try {
      const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from("wallet_config"), publicKey.toBuffer()],
        program.programId
      );
      setConfigPda(pda);

      const bal = await connection.getBalance(pda);
      setBalance(bal / LAMPORTS_PER_SOL);

      const config = await (program.account as any).walletConfig.fetch(pda);
      setWalletConfig(config);
      setIsFrozen(config.isFrozen);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching state:", err);
      if (err.message.includes("Account does not exist")) {
        setWalletConfig(null);
      } else {
        setError("Failed to fetch wallet config");
      }
    }
  }, [publicKey, program, connection]);

  useEffect(() => {
    fetchState();
    const id = setInterval(fetchState, 10000);
    return () => clearInterval(id);
  }, [fetchState]);

  useEffect(() => {
    if (program && publicKey && configPda && walletConfig && isOwner) {
      const stopAgent = startAgent(
        program,
        publicKey,
        configPda,
        walletConfig.allowlist.length > 0 ? walletConfig.allowlist : [PublicKey.default],
        (result) => {
          setTransactions(prev => [result, ...prev].slice(0, 50));
          fetchState();
        }
      );
      return () => stopAgent();
    }
  }, [program, publicKey, configPda, walletConfig, isOwner, fetchState]);

  const handleInitialize = async () => {
    if (!publicKey || !program) return;
    setIsLoading(true);
    try {
      await program.methods
        .initializeWallet({
          agent: publicKey, 
          maxTxAmount: (0.1 * LAMPORTS_PER_SOL) as any,
          dailyLimit: (0.5 * LAMPORTS_PER_SOL) as any,
          windowDuration: (24 * 60 * 60) as any,
          cooldownSeconds: (60) as any,
          allowlist: [],
        })
        .rpc();
      await fetchState();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFreeze = async () => {
    if (!publicKey || !program || !isOwner) return;
    setIsLoading(true);
    try {
      await program.methods.toggleFreeze().rpc();
      await fetchState();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePolicy = async (newPolicy: any) => {
    if (!publicKey || !program || !isOwner) return;
    setIsLoading(true);
    try {
      await program.methods
        .updatePolicy({
          maxTxAmount: (newPolicy.maxTx * LAMPORTS_PER_SOL) as any,
          dailyLimit: (newPolicy.dailyLimit * LAMPORTS_PER_SOL) as any,
          windowDuration: null,
          cooldownSeconds: null,
          allowlist: newPolicy.allowlist.map((a: string) => new PublicKey(a)),
        })
        .rpc();
      await fetchState();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-20">
      <section id="app" className="max-w-[1400px] mx-auto p-6 md:p-12 min-h-screen">
        <div className="flex items-center gap-4 mb-16">
          <div className="w-10 h-1 border-t-2 border-[var(--accent-teal)]"></div>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.4em] text-[var(--text-secondary)]">Vault Terminal</h2>
        </div>

        {error && (
          <div className="mb-12 p-6 bg-[var(--danger)]/5 border border-[var(--danger)]/20 text-[var(--danger)] flex items-center gap-4 animate-fade-in">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-[11px] font-mono font-bold uppercase tracking-widest">{error}</p>
          </div>
        )}

        {!publicKey ? (
          <div className="flex flex-col items-center justify-center py-40 border border-dashed border-[var(--border)]">
            <div className="w-20 h-20 bg-[var(--bg-surface)] border border-[var(--border)] flex items-center justify-center mb-10">
              <Zap className="w-8 h-8 text-[var(--accent-teal)]" />
            </div>
            <h2 className="text-4xl italic mb-6">Connect to Secure</h2>
            <p className="text-[var(--text-secondary)] mb-12 max-w-md text-center text-[13px] leading-relaxed">
              Connect your Solana wallet to manage your agent's spending policies and monitor real-time activity.
            </p>
            <WalletMultiButton className="!bg-[var(--accent-teal)] !text-[var(--bg-base)] !rounded-none !h-14 !px-10 !text-[14px] !font-medium !transition-transform !active:scale-[0.98]" />
          </div>
        ) : !walletConfig && !isLoading ? (
          <div className="max-w-2xl mx-auto py-20">
            <div className="leashd-card p-12 flex flex-col items-center text-center gap-10">
              <div className="p-6 bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--accent-teal)]">
                <ShieldAlert className="w-12 h-12" />
              </div>
              <div className="space-y-4">
                <h2 className="text-5xl italic tracking-tight">Initialize Vault</h2>
                <p className="text-[var(--text-secondary)] leading-relaxed text-[15px] font-light">
                  Deploy your on-chain security layer to begin enforcing policies on your autonomous agent.
                </p>
              </div>
              <button onClick={handleInitialize} className="leashd-button-primary w-full py-6 text-[14px]">
                Deploy vault
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4 flex flex-col gap-10 animate-entrance" style={{ animationDelay: '0.1s' }}>
              <WalletStatus 
                balance={balance} 
                address={configPda?.toBase58() || "Not Deployed"} 
                isFrozen={isFrozen}
                onRefresh={fetchState}
              />
              
              {isOwner ? (
                <div className="animate-entrance" style={{ animationDelay: '0.2s' }}>
                  <KillSwitch 
                    isFrozen={isFrozen} 
                    onToggle={handleToggleFreeze}
                    isLoading={isLoading}
                  />
                </div>
              ) : (
                <div className="leashd-card p-10 flex flex-col items-center text-center gap-6 grayscale opacity-50 animate-entrance" style={{ animationDelay: '0.2s' }}>
                  <ShieldAlert className="w-10 h-10 text-[var(--accent-purple)]" />
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Read-Only Mode</p>
                    <p className="text-[10px] text-[var(--text-muted)] leading-relaxed font-bold uppercase tracking-widest">Controls restricted to owner wallet</p>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-8 flex flex-col gap-10">
              {isOwner ? (
                <div className="animate-entrance" style={{ animationDelay: '0.3s' }}>
                  <PolicyConfig 
                    currentPolicy={{
                      maxTxAmount: walletConfig ? Number(walletConfig.maxTxAmount) / LAMPORTS_PER_SOL : 0,
                      dailyLimit: walletConfig ? Number(walletConfig.dailyLimit) / LAMPORTS_PER_SOL : 0,
                      allowlist: walletConfig?.allowlist?.map((p: PublicKey) => p.toBase58()) || []
                    }}
                    onUpdate={handleUpdatePolicy}
                    isLoading={isLoading}
                  />
                </div>
              ) : (
                <div className="leashd-card p-20 flex flex-col items-center justify-center text-center gap-6 opacity-30 animate-entrance" style={{ animationDelay: '0.3s' }}>
                  <Lock className="w-12 h-12 mb-4" />
                  <h3 className="text-3xl italic">Policy Locked</h3>
                </div>
              )}

              <div className="animate-entrance" style={{ animationDelay: '0.4s' }}>
                <TransactionFeed transactions={transactions} />
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen selection:bg-[var(--accent-teal)]/30">
      <Navbar />
      <main>
        <HeroSection />
        <DocsSection />
        <Dashboard />
      </main>

      <footer className="mt-40 py-40 border-t border-[var(--border)] bg-[var(--bg-surface)]">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col items-center gap-12 text-center">
          <div className="text-4xl italic font-serif text-[var(--text-primary)] tracking-widest">
            leashd
            <span className="inline-block w-2 h-2 bg-[var(--accent-teal)] rounded-full ml-2"></span>
          </div>
          <div className="space-y-4">
            <p className="text-[12px] font-medium text-[var(--text-secondary)]">
              Autonomous Security Protocol
            </p>
            <p className="text-[12px] font-medium text-[var(--text-muted)]">
              Built for the agentic future of Solana.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
