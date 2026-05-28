import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ArrowRight, CheckCircle2, XCircle, Clock, ExternalLink } from 'lucide-react';

export interface Transaction {
  signature: string;
  recipient: string;
  amount: number;
  success: boolean;
  error?: string;
  timestamp: number;
}

interface TransactionFeedProps {
  transactions: Transaction[];
}

export const TransactionFeed: React.FC<TransactionFeedProps> = ({ transactions }) => {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transactions.length > 0 && listRef.current) {
      const firstChild = listRef.current.firstChild as HTMLElement;
      if (firstChild) {
        gsap.from(firstChild, {
          y: -20,
          opacity: 0,
          duration: 0.5,
          ease: 'power2.out',
        });
      }
    }
  }, [transactions]);

  return (
    <div className="leashd-card !p-0 overflow-hidden flex flex-col h-full min-h-[500px]">
      <div className="p-6 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-surface)] sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-[var(--accent-teal)]" />
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)]">Agent Activity Feed</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[var(--accent-teal)] rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Live</span>
          </div>
        </div>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto max-h-[600px] scrollbar-hide">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-20 text-center opacity-30">
            <ActivityIcon className="w-12 h-12 mb-4" />
            <p className="text-[11px] uppercase font-bold tracking-[0.3em]">No activity detected</p>
          </div>
        ) : (
          transactions.map((tx, i) => (
            <div 
              key={tx.signature || i} 
              className="group border-b border-[var(--border)] last:border-0 p-5 hover:bg-[var(--bg-elevated)] transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-6">
                <div className={`p-3 rounded-full ${tx.success ? 'bg-[var(--accent-teal)]/5 text-[var(--accent-teal)]' : 'bg-[var(--danger)]/5 text-[var(--danger)]'}`}>
                  {tx.success ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] font-mono font-bold text-[var(--text-primary)]">{tx.amount.toFixed(4)} SOL</span>
                    <ArrowRight className="w-3 h-3 text-[var(--text-muted)]" />
                    <span className="text-[11px] font-mono text-[var(--text-secondary)]">
                      {tx.recipient.slice(0, 4)}...{tx.recipient.slice(-4)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                    <span className="font-mono">{new Date(tx.timestamp).toLocaleTimeString()}</span>
                    <span>•</span>
                    <span className={tx.success ? 'text-[var(--accent-teal)]' : 'text-[var(--danger)]'}>
                      {tx.success ? 'Instruction Success' : 'Guardrail Triggered'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {!tx.success && tx.error && (
                  <div className="group/tooltip relative">
                    <div className="px-2 py-1 border border-[var(--danger)]/30 text-[var(--danger)] text-[9px] font-bold uppercase tracking-tighter cursor-help">
                      Error Detail
                    </div>
                    <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-[var(--bg-elevated)] border border-[var(--border)] text-[11px] text-[var(--text-secondary)] opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
                      <p className="font-mono break-words">{tx.error}</p>
                    </div>
                  </div>
                )}
                {tx.signature && (
                  <a 
                    href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 border border-[var(--border)] hover:border-[var(--accent-teal)]/40 text-[var(--text-muted)] hover:text-[var(--accent-teal)] transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const ActivityIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
