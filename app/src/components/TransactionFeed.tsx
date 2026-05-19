import React from 'react';
import { ExternalLink, CheckCircle2, XCircle, Radar } from 'lucide-react';

export interface Transaction {
  signature: string;
  recipient: string;
  amount: number;
  timestamp: number;
  success: boolean;
  error?: string;
}

interface TransactionFeedProps {
  transactions: Transaction[];
}

export const TransactionFeed: React.FC<TransactionFeedProps> = ({ transactions }) => {
  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  return (
    <div className="leashd-card p-10">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#7B61FF]/10 rounded-lg text-[#7B61FF]">
            <Radar className="w-5 h-5" />
          </div>
          <h2 className="text-xs font-cormorant italic uppercase tracking-[0.15em] text-[#F0EBE3]/45">
            Agent Intelligence Feed
          </h2>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-[#00A19B]/10 rounded-full border border-[#00A19B]/20">
          <div className="w-1.5 h-1.5 bg-[#00A19B] rounded-full animate-pulse-teal" />
          <span className="text-[10px] font-black uppercase tracking-widest text-[#00A19B]">Live Monitoring</span>
        </div>
      </div>

      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4">
        {transactions.length > 0 ? (
          transactions.map((tx, idx) => (
            <div key={tx.signature || idx} className="flex items-center gap-6 p-5 bg-white/[0.02] border border-white/[0.05] rounded-2xl hover:bg-white/[0.04] transition-all">
              <div className="shrink-0">
                {tx.success ? (
                  <div className="p-2 bg-[#00E396]/10 text-[#00E396] rounded-full">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="p-2 bg-[#FF4560]/10 text-[#FF4560] rounded-full">
                    <XCircle className="w-5 h-5" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-mono font-medium tracking-tight">
                    {tx.amount.toFixed(3)}
                  </span>
                  <span className="text-[10px] font-bold text-[#00A19B]">SOL</span>
                  <span className="text-[#F0EBE3]/20 mx-1">→</span>
                  <span className="font-mono text-[11px] text-[#F0EBE3]/60 bg-white/[0.05] px-2 py-0.5 rounded border border-white/[0.05]">
                    {truncateAddress(tx.recipient)}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 mt-2">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                    tx.success ? 'text-[#00E396]' : 'text-[#FF4560]'
                  }`}>
                    {tx.success ? 'Approved' : 'Policy Blocked'}
                  </span>
                  {!tx.success && tx.error && (
                    <span className="text-[9px] font-mono text-[#FF4560]/50 truncate max-w-[180px]">
                      {tx.error}
                    </span>
                  )}
                  {tx.success && (
                    <a 
                      href={`https://solscan.io/tx/${tx.signature}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] font-bold text-[#00A19B] hover:text-[#00C4BD] uppercase tracking-widest flex items-center gap-1"
                    >
                      Solscan <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>

              <div className="text-[10px] font-mono text-[#F0EBE3]/20">
                {formatTimeAgo(tx.timestamp)}
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 flex flex-col items-center justify-center opacity-20">
            <Radar className="w-12 h-12 mb-4" />
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-center">Awaiting Agent Activity...</p>
          </div>
        )}
      </div>
    </div>
  );
};
