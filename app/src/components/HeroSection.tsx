import React from 'react';

export const HeroSection = () => {
  return (
    <section id="hero" className="min-h-[100dvh] flex flex-col items-center justify-center px-6 pt-20">
      <div className="max-w-[1400px] w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center animate-entrance">
        <div className="space-y-12">
          <div className="space-y-6">
            <h1 className="text-[120px] leading-[0.9] italic tracking-tighter text-[var(--text-primary)]">
              leashd
            </h1>
            <p className="text-2xl font-light text-[var(--text-secondary)] max-w-lg leading-relaxed">
              On-chain guardrails for autonomous AI agents.
            </p>
          </div>

          <p className="text-[15px] text-[var(--text-muted)] max-w-lg leading-relaxed">
            AI agents are about to control money at scale. Leashd enforces spending limits and kill switches at the contract level.
          </p>

          <div className="flex gap-6">
            <button 
              onClick={() => document.getElementById('app')?.scrollIntoView({ behavior: 'smooth' })}
              className="leashd-button-primary text-[14px] px-10 py-5"
            >
              Launch app
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { label: "Max transaction", value: "Locked on-chain", color: "var(--accent-teal)" },
            { label: "Daily limit", value: "24h Window", color: "var(--accent-purple)" },
            { label: "Allowlist", value: "Enforced", color: "var(--accent-teal)" },
            { label: "Kill switch", value: "Instant", color: "var(--danger)" }
          ].map((item, i) => (
            <div 
              key={i} 
              className="flex items-center justify-between p-8 border-b border-[var(--border)] hover:bg-[var(--bg-elevated)] transition-colors"
            >
              <div className="space-y-1">
                <span className="text-[12px] font-medium text-[var(--text-muted)]">
                  {item.label}
                </span>
                <p className="text-2xl italic text-[var(--text-primary)] font-serif tracking-tight">
                  {item.value}
                </p>
              </div>
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: item.color }}
              ></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
