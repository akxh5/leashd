import React from 'react';
import { RefreshCw, ExternalLink, ShieldOff } from 'lucide-react';

interface WalletStatusProps {
  balance: number;
  address: string;
  isFrozen: boolean;
  onRefresh: () => void;
}

export const WalletStatus: React.FC<WalletStatusProps> = ({ balance, address, isFrozen, onRefresh }) => {
  const truncatedAddress = address !== "Not Deployed" 
    ? `${address.slice(0, 6)}...${address.slice(-6)}` 
    : address;

  return (
    <div className={`leashd-card space-y-8 ${isFrozen ? 'border-[var(--danger)] glow-danger' : ''}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)]">Vault Status</h3>
        <button onClick={onRefresh} className="p-2 hover:bg-[var(--bg-elevated)] transition-colors rounded-none group">
          <RefreshCw className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--accent-teal)] transition-colors" />
        </button>
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline gap-3">
          <span className="text-6xl font-mono tracking-tighter text-[var(--text-primary)]">{balance.toFixed(4)}</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--accent-teal)]">SOL</span>
        </div>
        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.4em] font-bold italic font-serif">Current Liquidity</p>
      </div>

      <div className="space-y-4 border-t border-[var(--border)] pt-6">
        <div className="data-row">
          <span className="data-label">PDA Address</span>
          <div className="flex items-center gap-2">
            <span className="data-value">{truncatedAddress}</span>
            <ExternalLink className="w-3 h-3 text-[var(--text-muted)]" />
          </div>
        </div>
        <div className="data-row">
          <span className="data-label">Network</span>
          <span className="data-value !text-[var(--accent-purple)] uppercase">Solana Devnet</span>
        </div>
        <div className="data-row">
          <span className="data-label">Status</span>
          <span className={`data-value uppercase ${isFrozen ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>
            {isFrozen ? 'Frozen' : 'Active'}
          </span>
        </div>
      </div>

      {isFrozen && (
        <div className="p-4 bg-[var(--danger)]/10 border border-[var(--danger)]/20 flex items-center gap-3">
          <ShieldOff className="w-4 h-4 text-[var(--danger)]" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--danger)]">
            Emergency lock active. All agent transactions blocked on-chain.
          </p>
        </div>
      )}
    </div>
  );
};
