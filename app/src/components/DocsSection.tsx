import React from 'react';
import { Lock, Activity, Shield, Timer, Zap } from 'lucide-react';

export const DocsSection = () => {
  return (
    <section id="guardrails" className="py-40 px-6 border-y border-[var(--border)] animate-entrance" style={{ animationDelay: '0.2s' }}>
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
        
        {/* Column 1: The Problem */}
        <div className="space-y-12">
          <div className="space-y-4">
            <h3 className="text-5xl italic tracking-tight text-[var(--accent-teal)]">The Problem</h3>
            <div className="h-0.5 w-full bg-[var(--border)] relative">
              <div className="absolute left-0 top-0 h-full w-20 bg-[var(--accent-teal)]"></div>
            </div>
          </div>
          <p className="text-2xl text-[var(--text-secondary)] leading-relaxed font-light italic font-serif">
            "AI agents with unrestricted wallets are a liability. One rogue decision and funds are gone."
          </p>
          <div className="space-y-6">
            <p className="text-[12px] text-[var(--text-muted)] font-medium">
              Autonomous risk:
            </p>
            <ul className="space-y-4 text-[13px] text-[var(--text-secondary)]">
              <li className="flex items-center gap-4">
                <span className="w-1 h-1 bg-[var(--danger)]"></span>
                Drain attacks via API compromise
              </li>
              <li className="flex items-center gap-4">
                <span className="w-1 h-1 bg-[var(--danger)]"></span>
                Hallucination-driven transactions
              </li>
              <li className="flex items-center gap-4">
                <span className="w-1 h-1 bg-[var(--danger)]"></span>
                Unbounded spending in agent loops
              </li>
            </ul>
          </div>
        </div>

        {/* Column 2: The Guardrails */}
        <div className="space-y-12">
          <div className="space-y-4">
            <h3 className="text-5xl italic tracking-tight text-[var(--accent-purple)]">The Guardrails</h3>
            <div className="h-0.5 w-full bg-[var(--border)] relative">
              <div className="absolute left-0 top-0 h-full w-20 bg-[var(--accent-purple)]"></div>
            </div>
          </div>
          <div className="space-y-4 divide-y divide-[var(--border)]">
            {[
              { icon: <Lock className="w-4 h-4" />, title: "Max amount", desc: "Cap how much an agent can send per transaction" },
              { icon: <Activity className="w-4 h-4" />, title: "Daily limit", desc: "Rolling window spending ceiling" },
              { icon: <Shield className="w-4 h-4" />, title: "Allowlist", desc: "Agent can only send to pre-approved addresses" },
              { icon: <Timer className="w-4 h-4" />, title: "Cooldown", desc: "Minimum time enforced between transactions" },
              { icon: <Zap className="w-4 h-4" />, title: "Kill switch", desc: "Owner can freeze everything instantly, on-chain" }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 py-4 first:pt-0">
                <div className="text-[var(--accent-purple)] mt-1">{item.icon}</div>
                <div className="space-y-1">
                  <h4 className="text-[12px] font-medium text-[var(--text-primary)]">{item.title}</h4>
                  <p className="text-[13px] text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: How To Use */}
        <div className="space-y-12">
          <div className="space-y-4">
            <h3 className="text-5xl italic tracking-tight text-[var(--accent-teal)]">How To Use</h3>
            <div className="h-0.5 w-full bg-[var(--border)] relative">
              <div className="absolute left-0 top-0 h-full w-20 bg-[var(--accent-teal)]"></div>
            </div>
          </div>
          <div className="space-y-10">
            {[
              "Connect your Phantom wallet (devnet)",
              "Initialize vault, set your policy limits",
              "Fund the wallet PDA with SOL",
              "Watch agent simulation in real time",
              "Toggle Freeze for emergency lockdown"
            ].map((step, i) => (
              <div key={i} className="flex gap-6 items-start">
                <span className="flex-shrink-0 w-8 h-8 border border-[var(--border)] flex items-center justify-center font-mono text-[12px] text-[var(--accent-teal)]">
                  {i + 1}
                </span>
                <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed pt-1">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
