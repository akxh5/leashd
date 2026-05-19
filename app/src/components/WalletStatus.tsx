import React from 'react';
import { Shield, ShieldOff, Wallet, RefreshCw } from 'lucide-react';

interface WalletStatusProps {
  balance: number;
  address: string;
  isFrozen: boolean;
  onRefresh: () => void;
}

export const WalletStatus: React.FC<WalletStatusProps> = ({ balance, address, isFrozen, onRefresh }) => {
  return (
    <div className="leashd-card p-8 flex flex-col gap-6 max-w-md w-full">
      <div className="flex justify-between items-center">
        <h2 className="text-xs font-cormorant italic uppercase tracking-[0.15em] text-[#F0EBE3]/45">
          Wallet Status
        </h2>
        <button 
          onClick={onRefresh}
          className="p-2 text-[#F0EBE3]/45 hover:text-[#00A19B] transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-mono font-medium tracking-tight">{balance.toFixed(4)}</span>
          <span className="text-sm font-bold text-[#00A19B]">SOL</span>
        </div>
        
        <div className="text-[10px] font-mono text-[#F0EBE3]/30 break-all bg-white/[0.02] p-3 rounded-lg border border-white/[0.05]">
          {address}
        </div>
      </div>

      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
        isFrozen 
          ? 'bg-[#7B61FF]/10 border-[#7B61FF]/30 text-[#7B61FF]' 
          : 'bg-[#00A19B]/10 border-[#00A19B]/30 text-[#00A19B]'
      } transition-colors duration-500`}>
        {isFrozen ? (
          <ShieldOff className="w-5 h-5" />
        ) : (
          <Shield className="w-5 h-5" />
        )}
        <span className="text-[10px] font-black uppercase tracking-[0.15em]">
          {isFrozen ? 'Vault Frozen' : 'Agent Active'}
        </span>
      </div>
    </div>
  );
};
