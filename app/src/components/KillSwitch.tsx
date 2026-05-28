import React, { useState } from 'react';
import { Zap, AlertTriangle, ShieldCheck } from 'lucide-react';

interface KillSwitchProps {
  isFrozen: boolean;
  onToggle: () => void;
  isLoading: boolean;
}

export const KillSwitch: React.FC<KillSwitchProps> = ({ isFrozen, onToggle, isLoading }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleToggle = () => {
    if (!isFrozen && !showConfirm) {
      setShowConfirm(true);
      return;
    }
    onToggle();
    setShowConfirm(false);
  };

  return (
    <div className={`leashd-card relative overflow-hidden flex flex-col gap-6 transition-all duration-500 ${isFrozen ? 'border-[var(--danger)] glow-danger' : 'border-[var(--border)]'}`}>
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <Zap className={`w-5 h-5 ${isFrozen ? 'text-[var(--danger)]' : 'text-[var(--accent-teal)]'}`} />
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)]">Emergency Kill Switch</h3>
        </div>
        {isFrozen && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--danger)] animate-pulse">
            System Locked
          </span>
        )}
      </div>

      <p className="text-[13px] text-[var(--text-muted)] leading-relaxed relative z-10">
        The Kill Switch is an on-chain instruction that instantly freezes the vault. No agent can execute transfers until you manually unfreeze.
      </p>

      {showConfirm && !isFrozen ? (
        <div className="space-y-4 animate-fade-in relative z-10">
          <div className="p-4 bg-[var(--danger)]/5 border border-[var(--danger)]/20 flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 text-[var(--danger)]" />
            <p className="text-[11px] text-[var(--danger)] font-medium uppercase tracking-wider">
              Confirm immediate vault lockdown?
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleToggle}
              disabled={isLoading}
              className="flex-1 bg-[var(--danger)] text-[var(--bg-base)] py-4 font-bold uppercase tracking-widest text-[11px] hover:opacity-90 transition-opacity"
            >
              {isLoading ? 'Processing...' : 'Execute Freeze'}
            </button>
            <button 
              onClick={() => setShowConfirm(false)}
              className="px-6 border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-[11px] uppercase font-bold tracking-widest"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`relative z-10 w-full py-5 font-bold uppercase tracking-[0.3em] text-[12px] transition-all flex items-center justify-center gap-3 
            ${isFrozen 
              ? 'bg-[var(--bg-elevated)] border border-[var(--accent-teal)]/30 text-[var(--accent-teal)] hover:bg-[var(--accent-teal)]/10' 
              : 'bg-[var(--danger)]/5 border border-[var(--danger)]/40 text-[var(--danger)] hover:bg-[var(--danger)]/10'}`}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          ) : isFrozen ? (
            <>
              <ShieldCheck className="w-4 h-4" />
              Lift Emergency Lock
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Kill Switch: FREEZE
            </>
          )}
        </button>
      )}
    </div>
  );
};
