import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useProgram } from './hooks/useProgram';
import { WalletStatus } from './components/WalletStatus';
import { KillSwitch } from './components/KillSwitch';
import { PolicyConfig } from './components/PolicyConfig';
import { TransactionFeed, Transaction } from './components/TransactionFeed';
import { startAgent } from './agent';
import { ShieldAlert, Zap, AlertCircle, LayoutDashboard, Home, Lock } from 'lucide-react';
import Landing from './pages/Landing';

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
          allowlist: null,
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
    <div className="min-h-screen bg-[#0A0A0F] text-[#F0EBE3] selection:bg-teal-500/30">
      <nav className="border-b border-white/5 bg-[#0A0A0F]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link to="/" className="font-cormorant text-3xl italic uppercase tracking-[0.2em] hover:opacity-70 transition-opacity">
              Leashd
            </Link>
            <div className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-[#F0EBE3]/40">
              <Link to="/dashboard" className="text-[#00A19B] flex items-center gap-2">
                <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
              </Link>
              <Link to="/" className="hover:text-[#F0EBE3] transition-colors flex items-center gap-2">
                <Home className="w-3.5 h-3.5" /> Landing
              </Link>
            </div>
          </div>
          <WalletMultiButton />
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto p-8 md:p-12">
        {error && (
          <div className="mb-12 p-5 bg-[#FF4560]/10 border border-[#FF4560]/20 text-[#FF4560] flex items-center gap-4 rounded-2xl animate-fade-up">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-xs font-mono font-medium">{error}</p>
          </div>
        )}

        {!publicKey ? (
          <div className="flex flex-col items-center justify-center py-40 animate-fade-up">
            <div className="w-20 h-20 bg-[#00A19B]/10 rounded-full flex items-center justify-center mb-8">
              <Zap className="w-10 h-10 text-[#00A19B]" />
            </div>
            <h2 className="text-4xl font-cormorant italic uppercase tracking-widest mb-4">Connect to Secure</h2>
            <p className="text-[#F0EBE3]/40 mb-10 max-w-md text-center">Connect your Solana wallet to manage your agent's spending policies and monitor real-time activity.</p>
            <WalletMultiButton />
          </div>
        ) : !walletConfig && !isLoading ? (
          <div className="max-w-xl mx-auto py-20 animate-fade-up">
            <div className="leashd-card p-12 flex flex-col items-center text-center gap-8">
              <div className="p-5 bg-[#00A19B]/10 rounded-3xl text-[#00A19B]">
                <ShieldAlert className="w-12 h-12" />
              </div>
              <div className="space-y-3">
                <h2 className="text-4xl font-cormorant italic uppercase tracking-widest">Initialize Vault</h2>
                <p className="text-[#F0EBE3]/40 leading-relaxed font-light">Deploy your on-chain security layer to begin enforcing policies on your autonomous agent.</p>
              </div>
              <button onClick={handleInitialize} className="w-full bg-[#00A19B] text-[#0A0A0F] font-bold py-5 rounded-2xl text-lg hover:bg-[#00C4BD] transition-all active:scale-[0.98] shadow-[0_10px_40px_rgba(0,161,155,0.15)]">
                Deploy Agent Vault →
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-fade-up">
            <div className="lg:col-span-4 flex flex-col gap-10">
              <WalletStatus 
                balance={balance} 
                address={configPda?.toBase58() || "Not Deployed"} 
                isFrozen={isFrozen}
                onRefresh={fetchState}
              />
              
              {isOwner ? (
                <KillSwitch 
                  isFrozen={isFrozen} 
                  onToggle={handleToggleFreeze}
                  isLoading={isLoading}
                />
              ) : (
                <div className="leashd-card p-10 flex flex-col items-center text-center gap-6">
                  <ShieldAlert className="w-12 h-12 text-[#7B61FF]" />
                  <div className="space-y-2">
                    <p className="font-cormorant text-2xl italic uppercase tracking-widest text-[#7B61FF]">Read-Only</p>
                    <p className="text-[10px] text-[#F0EBE3]/30 font-bold uppercase tracking-widest leading-relaxed">Admin controls restricted to owner wallet</p>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-8 flex flex-col gap-10">
              {isOwner ? (
                <PolicyConfig 
                  currentPolicy={{
                    maxTxAmount: walletConfig ? Number(walletConfig.maxTxAmount) / LAMPORTS_PER_SOL : 0,
                    dailyLimit: walletConfig ? Number(walletConfig.dailyLimit) / LAMPORTS_PER_SOL : 0,
                    allowlist: walletConfig?.allowlist?.map((p: PublicKey) => p.toBase58()) || []
                  }}
                  onUpdate={handleUpdatePolicy}
                  isLoading={isLoading}
                />
              ) : (
                <div className="leashd-card p-20 flex flex-col items-center justify-center text-center gap-4 opacity-50 grayscale">
                  <Lock className="w-12 h-12 mb-4" />
                  <p className="font-cormorant text-3xl italic uppercase tracking-widest">Policy Locked</p>
                </div>
              )}

              <TransactionFeed transactions={transactions} />
            </div>
          </div>
        )}
      </main>

      <footer className="mt-20 py-20 border-t border-white/5 text-center opacity-30">
        <div className="font-cormorant text-xl italic uppercase tracking-[0.2em] mb-4">Leashd</div>
        <p className="text-[10px] font-bold uppercase tracking-[0.25em]">Autonomous Security Protocol v1.0</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
