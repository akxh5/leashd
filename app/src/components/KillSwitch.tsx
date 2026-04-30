import React from 'react';
import { Power } from 'lucide-react';

interface KillSwitchProps {
  isFrozen: boolean;
  onToggle: () => void;
  isLoading: boolean;
}

export const KillSwitch: React.FC<KillSwitchProps> = ({ isFrozen, onToggle, isLoading }) => {
  return (
    <div className="clay-card p-8 flex flex-col items-center gap-6 max-w-md w-full border-t-8 border-red-200">
      <h2 className="text-2xl font-black text-gray-700">Emergency Protocol</h2>
      
      <button
        onClick={onToggle}
        disabled={isLoading}
        className={`
          relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300
          ${isFrozen 
            ? 'bg-clay-mint shadow-clay-outset hover:scale-105 active:shadow-clay-active' 
            : 'bg-red-400 shadow-[8px_8px_16px_rgba(239,68,68,0.4),-8px_-8px_16px_rgba(255,255,255,0.8)] hover:scale-95 active:shadow-inner'
          }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <Power className={`w-16 h-16 ${isFrozen ? 'text-green-600' : 'text-white'}`} />
        {isLoading && (
          <div className="absolute inset-0 border-8 border-white/30 border-t-white rounded-full animate-spin" />
        )}
      </button>

      <div className="text-center">
        <p className={`font-black uppercase tracking-widest ${isFrozen ? 'text-green-600' : 'text-red-500'}`}>
          {isFrozen ? 'System Standby' : 'Live Authorization'}
        </p>
        <p className="text-sm text-gray-500 mt-2 font-medium">
          Owner-only override. This will immediately {isFrozen ? 'enable' : 'disable'} all agent transactions.
        </p>
      </div>
    </div>
  );
};
