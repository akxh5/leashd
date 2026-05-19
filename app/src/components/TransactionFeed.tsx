import React from 'react';
import { ExternalLink, CheckCircle2, XCircle } from 'lucide-react';

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
    <div className="clay-card p-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-clay-purple rounded-2xl shadow-clay-outset">
            <ExternalLink className="w-7 h-7 text-gray-700" />
          </div>
          <h3 className="text-2xl font-black text-gray-700">Agent Intel Feed</h3>
        </div>
        <span className="bg-clay-blue px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-gray-700">Live</span>
      </div>

      <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {transactions.length > 0 ? (
          transactions.map((tx, idx) => (
            <div key={tx.signature || idx} className="flex items-center gap-6 p-6 bg-clay-gray rounded-4xl shadow-clay-inset hover:scale-[1.01] transition-transform">
              <div className="p-4 bg-white rounded-3xl shadow-clay-outset">
                {tx.success ? (
                  <CheckCircle2 className="w-7 h-7 text-teal-500" />
                ) : (
                  <XCircle className="w-7 h-7 text-red-500" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-gray-800">
                    {tx.amount.toFixed(3)} SOL
                  </p>
                  <span className="text-gray-400 font-medium">to</span>
                  <p className="font-mono text-xs bg-white/50 px-2 py-1 rounded-lg text-gray-600">
                    {truncateAddress(tx.recipient)}
                  </p>
                </div>
                
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                    tx.success ? 'bg-teal-100 text-teal-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {tx.success ? 'SUCCESS' : 'BLOCKED'}
                  </span>
                  {!tx.success && tx.error && (
                    <span className="text-[10px] font-bold text-red-400 truncate max-w-[150px]">
                      {tx.error}
                    </span>
                  )}
                  {tx.success && (
                    <a 
                      href={`https://solscan.io/tx/${tx.signature}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-clay-blue hover:underline flex items-center gap-1"
                    >
                      View on Solscan <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              <div className="text-xs font-black text-gray-400 whitespace-nowrap">
                {formatTimeAgo(tx.timestamp)}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 font-bold py-10 italic">No activity yet. Deploy vault to begin.</p>
        )}
      </div>
    </div>
  );
};
