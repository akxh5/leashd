import React, { useState } from 'react';
import { Settings, Save, Info, Plus, X } from 'lucide-react';

interface PolicyConfigProps {
  currentPolicy: {
    maxTxAmount: number;
    dailyLimit: number;
    allowlist: string[];
  };
  onUpdate: (newPolicy: any) => void;
  isLoading: boolean;
}

export const PolicyConfig: React.FC<PolicyConfigProps> = ({ currentPolicy, onUpdate, isLoading }) => {
  const [maxTx, setMaxTx] = useState(currentPolicy.maxTxAmount.toString());
  const [dailyLimit, setDailyLimit] = useState(currentPolicy.dailyLimit.toString());
  const [newRecipient, setNewRecipient] = useState("");
  const [allowlist, setAllowlist] = useState<string[]>(currentPolicy.allowlist);

  const handleSave = () => {
    onUpdate({
      maxTx: parseFloat(maxTx),
      dailyLimit: parseFloat(dailyLimit),
      allowlist: allowlist
    });
  };

  const addRecipient = () => {
    if (newRecipient && !allowlist.includes(newRecipient)) {
      setAllowlist([...allowlist, newRecipient]);
      setNewRecipient("");
    }
  };

  const removeRecipient = (addr: string) => {
    setAllowlist(allowlist.filter(a => a !== addr));
  };

  return (
    <div className="leashd-card space-y-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-[var(--accent-teal)]" />
          <h3 className="text-[12px] font-medium text-[var(--text-secondary)]">Guardrail configuration</h3>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-[var(--accent-teal)]/5 border border-[var(--accent-teal)]/20">
          <Info className="w-3 h-3 text-[var(--accent-teal)]" />
          <span className="text-[10px] font-medium text-[var(--accent-teal)] uppercase tracking-wider">On-chain policy</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[12px] font-medium text-[var(--text-muted)]">Max transaction (SOL)</label>
            <span className="text-[12px] font-mono text-[var(--accent-teal)]">Current: {currentPolicy.maxTxAmount}</span>
          </div>
          <input 
            type="number" 
            value={maxTx}
            onChange={(e) => setMaxTx(e.target.value)}
            className="leashd-input !text-lg !font-mono"
            placeholder="0.1"
          />
          <p className="text-[12px] text-[var(--text-muted)] leading-relaxed">
            Individual transaction cap. Any attempt above this is blocked by the program.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[12px] font-medium text-[var(--text-muted)]">Daily limit (SOL)</label>
            <span className="text-[12px] font-mono text-[var(--accent-purple)]">Current: {currentPolicy.dailyLimit}</span>
          </div>
          <input 
            type="number" 
            value={dailyLimit}
            onChange={(e) => setDailyLimit(e.target.value)}
            className="leashd-input !text-lg !font-mono"
            placeholder="1.0"
          />
          <p className="text-[12px] text-[var(--text-muted)] leading-relaxed">
            Total spending allowed per 24h rolling window across all transactions.
          </p>
        </div>
      </div>

      <div className="space-y-6 pt-6 border-t border-[var(--border)]">
        <label className="text-[12px] font-medium text-[var(--text-muted)]">Recipient allowlist</label>
        
        <div className="flex gap-3">
          <input 
            type="text" 
            value={newRecipient}
            onChange={(e) => setNewRecipient(e.target.value)}
            className="leashd-input !py-4 font-mono text-[13px]"
            placeholder="Enter Solana Address..."
          />
          <button 
            onClick={addRecipient}
            className="px-6 bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--accent-teal)]/40 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {allowlist.length === 0 ? (
            <div className="py-12 flex items-center justify-center">
              <p className="text-[12px] font-medium text-[var(--text-muted)]">No addresses allowlisted</p>
            </div>
          ) : (
            allowlist.map((addr) => (
              <div key={addr} className="flex items-center justify-between py-4">
                <span className="text-[12px] font-mono text-[var(--text-secondary)]">
                  {addr.slice(0, 8)}...{addr.slice(-8)}
                </span>
                <button onClick={() => removeRecipient(addr)} className="text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <button 
        onClick={handleSave}
        disabled={isLoading}
        className="w-full leashd-button-primary !py-5 flex items-center justify-center gap-3"
      >
        {isLoading ? (
          'Updating...'
        ) : (
          <>
            <Save className="w-4 h-4" />
            Update policy
          </>
        )}
      </button>
    </div>
  );
};
