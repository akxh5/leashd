import React from 'react';
import { RefreshCw, ExternalLink, ShieldOff, Copy, Check } from 'lucide-react';
import { PublicKey } from '@solana/web3.js';

interface WalletStatusProps {
  balance: number;
  address: string;
  agentPubkey?: PublicKey | null;
  isFrozen: boolean;
  onRefresh: () => void;
}

export const WalletStatus: React.FC<WalletStatusProps> = ({ balance, address, agentPubkey, isFrozen, onRefresh }) => {
  const [copied, setCopied] = React.useState(false);

  const truncatedAddress = address !== "Not Deployed" 
    ? `${address.slice(0, 6)}...${address.slice(-6)}` 
    : address;

  const copyAgent = () => {
    if (agentPubkey) {
      navigator.clipboard.writeText(agentPubkey.toBase58());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`leashd-card space-y-8 ${isFrozen ? 'border-[var(--danger)]' : ''}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-[12px] font-medium text-[var(--text-secondary)]">Vault status</h3>
        <button onClick={onRefresh} className="p-2 hover:bg-[var(--bg-elevated)] transition-colors rounded-none group">
          <RefreshCw className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
        </button>
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline gap-3">
          <span className="text-6xl font-mono tracking-tighter text-[var(--text-primary)]">{balance.toFixed(4)}</span>
          <span className="text-[12px] font-medium text-[var(--accent-teal)]">SOL</span>
        </div>
        <p className="text-[13px] text-[var(--text-muted)] font-medium">Current liquidity</p>
      </div>

      <div className="space-y-4 border-t border-[var(--border)] pt-6">
        <div className="data-row">
          <span className="data-label">PDA Address</span>
          <div className="flex items-center gap-2">
            <span className="data-value">{truncatedAddress}</span>
            <ExternalLink className="w-3 h-3 text-[var(--text-muted)]" />
          </div>
        </div>
        
        {agentPubkey && (
          <div className="data-row">
            <span className="data-label">Authorized Agent</span>
            <button 
              onClick={copyAgent}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <span className="data-value">{agentPubkey.toBase58().slice(0, 4)}...{agentPubkey.toBase58().slice(-4)}</span>
              {copied ? <Check className="w-3 h-3 text-[var(--success)]" /> : <Copy className="w-3 h-3 text-[var(--text-muted)]" />}
            </button>
          </div>
        )}

        <div className="data-row">
          <span className="data-label">Network</span>
          <span className="data-value !text-[var(--accent-purple)]">Solana Devnet</span>
        </div>
        <div className="data-row">
          <span className="data-label">Status</span>
          <span className={`data-value ${isFrozen ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>
            {isFrozen ? 'Frozen' : 'Active'}
          </span>
        </div>
      </div>

      {isFrozen && (
        <div className="p-4 bg-[var(--danger)]/10 border border-[var(--danger)]/20 flex items-center gap-3">
          <ShieldOff className="w-4 h-4 text-[var(--danger)]" />
          <p className="text-[12px] font-medium text-[var(--danger)]">
            Emergency lock active. All agent transactions blocked on-chain.
          </p>
        </div>
      )}
    </div>
  );
};
