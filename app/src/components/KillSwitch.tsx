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
    <div className={`leashd-card flex flex-col gap-6 ${isFrozen ? 'border-[var(--danger)]' : 'border-[var(--border)]'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className={`w-5 h-5 ${isFrozen ? 'text-[var(--danger)]' : 'text-[var(--accent-teal)]'}`} />
          <h3 className="text-[12px] font-medium text-[var(--text-secondary)]">Emergency kill switch</h3>
        </div>
        {isFrozen && (
          <span className="text-[12px] font-medium text-[var(--danger)]">
            System locked
          </span>
        )}
      </div>

      <p className="text-[13px] text-[var(--text-muted)] leading-relaxed">
        The Kill Switch is an on-chain instruction that instantly freezes the vault. No agent can execute transfers until you manually unfreeze.
      </p>

      {showConfirm && !isFrozen ? (
        <div className="space-y-4">
          <div className="p-4 bg-[var(--danger)]/10 border border-[var(--danger)]/20 flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 text-[var(--danger)]" />
            <p className="text-[12px] text-[var(--danger)] font-medium">
              Confirm immediate vault lockdown?
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleToggle}
              disabled={isLoading}
              className="flex-1 bg-[var(--danger)] text-[var(--bg-base)] py-4 font-medium text-[13px] hover:opacity-90 transition-opacity"
            >
              {isLoading ? 'Processing...' : 'Confirm freeze'}
            </button>
            <button 
              onClick={() => setShowConfirm(false)}
              className="px-6 border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-[13px] font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`w-full py-5 font-medium text-[13px] transition-colors flex items-center justify-center gap-3 
            ${isFrozen 
              ? 'bg-[var(--bg-elevated)] border border-[var(--accent-teal)]/30 text-[var(--accent-teal)] hover:bg-[var(--accent-teal)]/10' 
              : 'bg-[var(--danger)]/10 border border-[var(--danger)]/40 text-[var(--danger)] hover:bg-[var(--danger)]/20'}`}
        >
          {isLoading ? (
            'Processing...'
          ) : isFrozen ? (
            <>
              <ShieldCheck className="w-4 h-4" />
              Unfreeze vault
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Freeze vault
            </>
          )}
        </button>
      )}
    </div>
  );
};
