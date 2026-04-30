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
    <div className="clay-card p-8 flex flex-col gap-4 max-w-md w-full">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-black text-gray-700">Wallet Status</h2>
        <button 
          onClick={onRefresh}
          className="p-3 bg-clay-purple rounded-full shadow-clay-outset active:shadow-clay-active hover:rotate-180 transition-all duration-500"
        >
          <RefreshCw className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      <div className="bg-clay-gray p-6 rounded-3xl shadow-clay-inset space-y-3">
        <div className="flex items-center gap-3">
          <Wallet className="text-clay-blue w-6 h-6" />
          <span className="font-bold text-lg">{balance.toFixed(4)} SOL</span>
        </div>
        <div className="text-xs text-gray-500 font-mono break-all bg-white/50 p-2 rounded-xl">
          {address}
        </div>
      </div>

      <div className={`flex items-center gap-3 p-4 rounded-2xl ${isFrozen ? 'bg-red-100' : 'bg-clay-mint'} transition-colors duration-300`}>
        {isFrozen ? (
          <>
            <ShieldOff className="text-red-500 w-8 h-8" />
            <span className="font-black text-red-600">WALLET FROZEN</span>
          </>
        ) : (
          <>
            <Shield className="text-green-500 w-8 h-8" />
            <span className="font-black text-green-600">AGENT ACTIVE</span>
          </>
        )}
      </div>
    </div>
  );
};
