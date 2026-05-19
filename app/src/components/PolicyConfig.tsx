import React, { useState } from 'react';
import { Settings, Plus, X, Terminal } from 'lucide-react';

interface PolicyConfigProps {
  currentPolicy: any;
  onUpdate: (newPolicy: any) => void;
  isLoading: boolean;
}

export const PolicyConfig: React.FC<PolicyConfigProps> = ({ currentPolicy, onUpdate, isLoading }) => {
  const [maxTx, setMaxTx] = useState(currentPolicy?.maxTxAmount || 0.1);
  const [dailyLimit, setDailyLimit] = useState(currentPolicy?.dailyLimit || 0.5);
  
  return (
    <div className="leashd-card p-10 flex flex-col gap-8 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#00A19B]/10 rounded-lg text-[#00A19B]">
            <Settings className="w-5 h-5" />
          </div>
          <h2 className="text-xs font-cormorant italic uppercase tracking-[0.15em] text-[#F0EBE3]/45">
            Policy Configuration
          </h2>
        </div>
        {isLoading && <span className="text-[10px] font-mono text-[#00A19B] animate-pulse">SYNCING ON-CHAIN...</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-[#F0EBE3]/30 uppercase tracking-widest ml-1">Max Per Transaction (SOL)</label>
          <div className="relative">
            <input 
              type="number"
              value={maxTx}
              onChange={(e) => setMaxTx(parseFloat(e.target.value))}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-4 font-mono text-xl focus:border-[#00A19B]/50 outline-none transition-all"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#00A19B]">MAX_TX</div>
          </div>
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-[#F0EBE3]/30 uppercase tracking-widest ml-1">Daily Spending Limit (SOL)</label>
          <div className="relative">
            <input 
              type="number"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(parseFloat(e.target.value))}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-4 font-mono text-xl focus:border-[#00A19B]/50 outline-none transition-all"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#00A19B]">LIMIT_24H</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <label className="text-[10px] font-bold text-[#F0EBE3]/30 uppercase tracking-widest">Authorized Recipients</label>
          <button className="text-[10px] font-bold text-[#00A19B] hover:text-[#00C4BD] flex items-center gap-1 uppercase tracking-widest">
            <Plus className="w-3 h-3" /> Add Address
          </button>
        </div>
        <div className="bg-black/20 rounded-2xl border border-white/[0.05] p-2 space-y-2 min-h-[120px]">
          {currentPolicy?.allowlist?.map((key: string, idx: number) => (
            <div key={idx} className="bg-white/[0.02] border border-white/[0.05] p-3 rounded-xl flex justify-between items-center group">
              <span className="font-mono text-[10px] text-[#F0EBE3]/60">{key}</span>
              <button className="text-[#FF4560] opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {!currentPolicy?.allowlist?.length && (
            <div className="h-full flex flex-col items-center justify-center py-8 opacity-20">
              <Terminal className="w-8 h-8 mb-2" />
              <p className="text-[10px] font-mono uppercase tracking-widest text-center">Allowlist Empty — Vault Locked</p>
            </div>
          )}
        </div>
      </div>

      <button 
        disabled={isLoading}
        onClick={() => onUpdate({ maxTx, dailyLimit })}
        className="w-full bg-[#00A19B] hover:bg-[#00C4BD] disabled:opacity-50 disabled:cursor-not-allowed text-[#0A0A0F] font-bold py-4 rounded-xl transition-all shadow-[0_0_24px_rgba(0,161,155,0.1)] active:scale-[0.98]"
      >
        {isLoading ? 'PROCESSING...' : 'SYNC ON-CHAIN POLICY'}
      </button>
    </div>
  );
};
