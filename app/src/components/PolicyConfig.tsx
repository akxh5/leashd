import React, { useState } from 'react';
import { Settings, Plus, X } from 'lucide-react';

interface PolicyConfigProps {
  currentPolicy: any;
  onUpdate: (newPolicy: any) => void;
  isLoading: boolean;
}

export const PolicyConfig: React.FC<PolicyConfigProps> = ({ currentPolicy, onUpdate, isLoading }) => {
  const [maxTx, setMaxTx] = useState(currentPolicy?.maxTxAmount || 0.1);
  const [dailyLimit, setDailyLimit] = useState(currentPolicy?.dailyLimit || 0.5);
  
  return (
    <div className="clay-card p-10 flex flex-col gap-6 max-w-2xl w-full">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-clay-mint rounded-2xl shadow-clay-outset">
          <Settings className="w-8 h-8 text-gray-700" />
        </div>
        <h2 className="text-3xl font-black text-gray-700">Policy Settings</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
        <div className="space-y-3">
          <label className="text-sm font-black text-gray-500 uppercase ml-2">Max per Transaction (SOL)</label>
          <input 
            type="number"
            value={maxTx}
            onChange={(e) => setMaxTx(parseFloat(e.target.value))}
            className="clay-input w-full text-lg font-bold"
          />
        </div>
        <div className="space-y-3">
          <label className="text-sm font-black text-gray-500 uppercase ml-2">Daily Limit (SOL)</label>
          <input 
            type="number"
            value={dailyLimit}
            onChange={(e) => setDailyLimit(parseFloat(e.target.value))}
            className="clay-input w-full text-lg font-bold"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <label className="text-sm font-black text-gray-500 uppercase">Allowlist</label>
          <button className="text-xs font-bold bg-clay-purple px-3 py-1 rounded-lg shadow-clay-outset hover:scale-110 active:shadow-clay-active">
            + Add New
          </button>
        </div>
        <div className="bg-clay-gray p-4 rounded-3xl shadow-clay-inset space-y-2 min-h-[100px]">
          {currentPolicy?.allowlist?.map((key: string, idx: number) => (
            <div key={idx} className="bg-white/70 p-3 rounded-xl flex justify-between items-center text-xs font-mono">
              {key}
              <button className="text-red-400 hover:text-red-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {!currentPolicy?.allowlist?.length && (
            <p className="text-center text-gray-400 text-sm py-4 italic">No addresses in allowlist</p>
          )}
        </div>
      </div>

      <button 
        disabled={isLoading}
        onClick={() => onUpdate({ maxTx, dailyLimit })}
        className="clay-button w-full mt-6 flex items-center justify-center gap-2"
      >
        {isLoading ? 'Processing...' : 'Sync Policy'}
      </button>
    </div>
  );
};
