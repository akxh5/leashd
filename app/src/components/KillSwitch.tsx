import React from 'react';
import { Power, Shield, ShieldOff, Loader2 } from 'lucide-react';

interface KillSwitchProps {
  isFrozen: boolean;
  onToggle: () => void;
  isLoading: boolean;
}

export const KillSwitch: React.FC<KillSwitchProps> = ({ isFrozen, onToggle, isLoading }) => {
  return (
    <div className="leashd-card p-8 flex flex-col items-center gap-6 max-w-md w-full">
      <h2 className="text-xs font-cormorant italic uppercase tracking-[0.15em] text-[#F0EBE3]/45">
        Emergency Protocol
      </h2>
      
      <button
        onClick={onToggle}
        disabled={isLoading}
        className={`
          relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 group
          ${isFrozen 
            ? 'border-[1.5px] border-[#7B61FF] text-[#7B61FF] shadow-[0_0_24px_rgba(123,97,255,0.15)]' 
            : 'border-[1.5px] border-[#FF4560] text-[#FF4560] hover:shadow-[0_0_24px_rgba(255,69,96,0.15)]'
          }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
        `}
      >
        {isLoading ? (
          <Loader2 className="w-12 h-12 animate-spin" />
        ) : isFrozen ? (
          <ShieldOff className="w-12 h-12" />
        ) : (
          <Power className="w-12 h-12" />
        )}
      </button>

      <div className="text-center">
        <p className={`text-xs font-black uppercase tracking-[0.2em] ${isFrozen ? 'text-[#7B61FF]' : 'text-[#FF4560]'}`}>
          {isFrozen ? 'System Frozen' : 'Live Authorization'}
        </p>
        <p className="text-xs text-[#F0EBE3]/45 mt-3 font-medium leading-relaxed max-w-[200px]">
          Immediate owner override to {isFrozen ? 'enable' : 'disable'} all agent transactions.
        </p>
      </div>
    </div>
  );
};
