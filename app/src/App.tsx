import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useProgram } from './hooks/useProgram';
import { WalletStatus } from './components/WalletStatus';
import { KillSwitch } from './components/KillSwitch';
import { PolicyConfig } from './components/PolicyConfig';
import { TransactionFeed, Transaction } from './components/TransactionFeed';
import { startAgent } from './agent';
import { ShieldAlert, Zap, AlertCircle } from 'lucide-react';

function App() {
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

  // Agent Simulation Integration
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
    <div className="min-h-screen bg-clay-gray p-6 md:p-12 lg:p-20 flex flex-col items-center">
      <div className="absolute top-6 right-6">
        <WalletMultiButton />
      </div>

      <header className="mb-16 text-center space-y-4">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="p-5 bg-white rounded-5xl shadow-clay-outset hover:rotate-12 transition-transform">
            <Zap className="w-12 h-12 text-clay-blue fill-clay-blue" />
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-gray-800">leashd</h1>
        </div>
        <p className="text-xl font-bold text-gray-500 max-w-lg mx-auto">
          The ultimate autonomous-agent security layer for your Solana vault.
        </p>
      </header>

      {error && (
        <div className="mb-8 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 flex items-center gap-3 rounded-xl shadow-clay-outset">
          <AlertCircle className="w-6 h-6" />
          <p className="font-bold">{error}</p>
        </div>
      )}

      {publicKey && !walletConfig && !isLoading && (
        <div className="mb-12 clay-card p-10 flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
          <h2 className="text-3xl font-black text-gray-700">Initialize Your Vault</h2>
          <p className="text-gray-500 font-medium text-center max-w-md">
            Deploy your secure agent wallet on-chain to start managing policies.
          </p>
          <button onClick={handleInitialize} className="clay-button px-12 py-4 text-xl">
            Deploy Vault
          </button>
        </div>
      )}

      <main className={`grid grid-cols-1 lg:grid-cols-12 gap-10 w-full max-w-7xl ${(!publicKey || !walletConfig) ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="lg:col-span-4 flex flex-col gap-10 items-center lg:items-end">
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
            <div className="clay-card p-8 flex flex-col items-center text-center gap-4 border-t-8 border-clay-purple max-w-md w-full">
              <ShieldAlert className="w-12 h-12 text-clay-purple" />
              <p className="font-bold text-gray-600">ReadOnly Mode</p>
              <p className="text-xs text-gray-400 font-medium">Connect owner wallet to manage policies</p>
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
            <div className="clay-card p-10 flex flex-col items-center justify-center min-h-[300px] gap-4">
              <ShieldAlert className="w-16 h-16 text-gray-200" />
              <p className="text-xl font-black text-gray-300">Policy Management Locked</p>
            </div>
          )}

          <TransactionFeed transactions={transactions} />
        </div>
      </main>

      <footer className="mt-20 opacity-40 hover:opacity-100 transition-opacity flex items-center gap-2">
        <div className="w-8 h-8 bg-gray-300 rounded-full shadow-clay-inset" />
        <span className="font-black text-gray-600 uppercase tracking-widest text-sm">Autonomous Security by Leashd</span>
      </footer>
    </div>
  );
}

export default App;
