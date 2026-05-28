import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { motion } from 'framer-motion';
import { useProgram } from './hooks/useProgram';
import { useLenis } from './hooks/useLenis';
import { WalletStatus } from './components/WalletStatus';
import { KillSwitch } from './components/KillSwitch';
import { PolicyConfig } from './components/PolicyConfig';
import { TransactionFeed, Transaction } from './components/TransactionFeed';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { startAgent } from './agent';
import { ShieldAlert, Zap, AlertCircle, Lock } from 'lucide-react';

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
      // Account not initialized yet — expected state
      if (err?.message?.includes('Account does not exist') ||
          err?.message?.includes('has no data')) {
        setWalletConfig(null);
        return;
      }
      // Only log unexpected errors
      console.error("Error fetching state:", err);
      setError("Failed to fetch wallet config");
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
    <section id="dashboard" className="max-w-[1400px] mx-auto p-6 md:p-12 min-h-screen pt-32">
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
  );
}

function App() {
  useLenis();

  return (
    <div className="min-h-screen selection:bg-[var(--accent-teal)]/30 bg-[#0A0A0F]">
      <Navbar />
      <main>
        <HeroSection />

        {/* SECTION 1 — id="overview" */}
        <section id="overview" className="relative py-32 px-8 md:px-24 bg-[#0A0A0F]">
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[rgba(0,161,155,0.2)] to-transparent" />
          <p className="text-xs tracking-[0.2em] uppercase text-[#00A19B] font-mono mb-4">
            How it works
          </p>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontSize: 'clamp(36px, 5vw, 64px)',
            color: '#F0EBE3',
            lineHeight: 1.1,
            marginBottom: '64px'
          }}>
            Three steps to a<br />leashed agent.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[rgba(255,255,255,0.06)]">
            {[
              {
                number: '01',
                title: 'Deploy',
                body: "Initialize a policy-enforced vault on Solana. The PDA holds your agent's funds. No separate escrow. No intermediaries."
              },
              {
                number: '02', 
                title: 'Configure',
                body: "Set spending limits, approved recipients, and cooldowns. Policies live on-chain — the agent cannot override them."
              },
              {
                number: '03',
                title: 'Monitor',
                body: "Every transaction — successful or blocked — is recorded. Hit the kill switch and everything stops. Instantly."
              }
            ].map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="bg-[#0A0A0F] p-10 group hover:bg-[#0F0F1A] transition-colors duration-300"
              >
                <span style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '11px',
                  color: 'rgba(0,161,155,0.5)',
                  letterSpacing: '0.15em'
                }}>
                  {step.number}
                </span>
                <h3 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: 'italic',
                  fontSize: '32px',
                  color: '#F0EBE3',
                  margin: '16px 0 12px'
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontSize: '14px',
                  lineHeight: 1.7,
                  color: 'rgba(240,235,227,0.45)'
                }}>
                  {step.body}
                </p>
                <div className="mt-8 h-px w-0 group-hover:w-full bg-[#00A19B] transition-all duration-500 ease-out" />
              </motion.div>
            ))}
          </div>
        </section>

        {/* SECTION 2 — id="guardrails" */}
        <section id="guardrails" className="relative py-32 px-8 md:px-24 bg-[#0A0A0F]">
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.08)] to-transparent" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-[#00A19B] font-mono mb-4">
                On-chain enforcement
              </p>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: 'italic',
                fontSize: 'clamp(36px, 4vw, 56px)',
                color: '#F0EBE3',
                lineHeight: 1.1
              }}>
                Rules the agent<br />cannot break.
              </h2>
              <p className="mt-6 text-sm leading-relaxed" style={{ color: 'rgba(240,235,227,0.45)', maxWidth: '360px' }}>
                Every guardrail is enforced at the contract level. Not middleware. Not a frontend check. The chain rejects violations before they execute.
              </p>
            </div>

            <div className="flex flex-col">
              {[
                { label: 'Spending limit', desc: 'Max SOL per transaction. The agent cannot exceed it.', color: '#00A19B' },
                { label: 'Daily budget', desc: 'Rolling 24h window. Resets automatically.', color: '#00A19B' },
                { label: 'Allowlist', desc: 'Only approved addresses receive funds. Unknown = rejected.', color: '#7B61FF' },
                { label: 'Cooldown', desc: 'Minimum time between transactions. Stops drain attacks.', color: '#7B61FF' },
                { label: 'Kill switch', desc: 'One instruction. Wallet frozen. Agent stops immediately.', color: '#FF4560' }
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="flex items-start gap-4 py-6 border-b group hover:pl-2 transition-all duration-300"
                  style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                >
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: '#F0EBE3' }}>{item.label}</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(240,235,227,0.45)' }}>{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 3 — CTA + Footer */}
        <section className="relative py-32 px-8 md:px-24 bg-[#0A0A0F] text-center">
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[rgba(0,161,155,0.15)] to-transparent" />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              fontSize: 'clamp(40px, 6vw, 80px)',
              color: '#F0EBE3',
              lineHeight: 1.05,
              marginBottom: '24px'
            }}>
              Leash your agent.
            </h2>
            <p className="text-sm mb-12 mx-auto" style={{ color: 'rgba(240,235,227,0.45)', maxWidth: '400px', lineHeight: 1.7 }}>
              Deploy a policy-enforced vault in minutes. Free on devnet.
            </p>

            <button 
              onClick={() => document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-10 py-4 text-sm font-semibold tracking-wide rounded-lg transition-all duration-200"
              style={{
                background: '#00A19B',
                color: '#0A0A0F',
                boxShadow: '0 0 32px rgba(0,161,155,0.25)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.scale = '1.02';
                e.currentTarget.style.boxShadow = '0 0 48px rgba(0,161,155,0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.scale = '1';
                e.currentTarget.style.boxShadow = '0 0 32px rgba(0,161,155,0.25)';
              }}
            >
              Launch app →
            </button>
          </motion.div>

          {/* Footer */}
          <div className="mt-32 pt-8 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              fontSize: '16px',
              color: 'rgba(240,235,227,0.3)'
            }}>
              leashd
            </span>
            <span className="text-xs font-mono" style={{ color: 'rgba(240,235,227,0.25)' }}>
              Built on Solana
            </span>
            <a 
              href="https://github.com/akxh5/leashd"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono transition-colors"
              style={{ color: 'rgba(240,235,227,0.25)' }}
              onMouseEnter={e => (e.target as HTMLElement).style.color = '#00A19B'}
              onMouseLeave={e => (e.target as HTMLElement).style.color = 'rgba(240,235,227,0.25)'}
            >
              GitHub →
            </a>
          </div>
        </section>

        <Dashboard />
      </main>
    </div>
  );
}

export default App;
