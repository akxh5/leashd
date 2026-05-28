import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Lock, Activity, Shield, Timer, Zap } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const DocsSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.docs-column', {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
        },
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out',
      });

      gsap.from('.step-number', {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
        },
        scale: 0,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'back.out(2)',
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="guardrails" ref={containerRef} className="py-40 px-6 border-y border-[var(--border)]">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
        
        {/* Column 1: The Problem */}
        <div className="docs-column space-y-12">
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
            <p className="text-[10px] text-[var(--text-muted)] leading-relaxed uppercase tracking-[0.4em] font-bold">
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
        <div className="docs-column space-y-12">
          <div className="space-y-4">
            <h3 className="text-5xl italic tracking-tight text-[var(--accent-purple)]">The Guardrails</h3>
            <div className="h-0.5 w-full bg-[var(--border)] relative">
              <div className="absolute left-0 top-0 h-full w-20 bg-[var(--accent-purple)]"></div>
            </div>
          </div>
          <div className="space-y-4 divide-y divide-[var(--border)]">
            {[
              { icon: <Lock className="w-4 h-4" />, title: "Max TX Amount", desc: "Cap how much an agent can send per transaction" },
              { icon: <Activity className="w-4 h-4" />, title: "Daily Limit", desc: "Rolling window spending ceiling" },
              { icon: <Shield className="w-4 h-4" />, title: "Allowlist", desc: "Agent can only send to pre-approved addresses" },
              { icon: <Timer className="w-4 h-4" />, title: "Cooldown", desc: "Minimum time enforced between transactions" },
              { icon: <Zap className="w-4 h-4" />, title: "Kill Switch", desc: "Owner can freeze everything instantly, on-chain" }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 py-4 first:pt-0">
                <div className="text-[var(--accent-purple)] mt-1">{item.icon}</div>
                <div className="space-y-1">
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-primary)]">{item.title}</h4>
                  <p className="text-[13px] text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: How To Use */}
        <div className="docs-column space-y-12">
          <div className="space-y-4">
            <h3 className="text-5xl italic tracking-tight text-[var(--accent-teal)]">How To Use</h3>
            <div className="h-0.5 w-full bg-[var(--border)] relative">
              <div className="absolute left-0 top-0 h-full w-20 bg-[var(--accent-teal)]"></div>
            </div>
          </div>
          <div className="space-y-10">
            {[
              "Connect your Phantom wallet (devnet)",
              "Initialize Wallet — set your policy limits",
              "Fund the wallet PDA with SOL",
              "Watch agent simulation in real time",
              "Toggle Freeze for emergency lockdown"
            ].map((step, i) => (
              <div key={i} className="flex gap-6 items-start">
                <span className="step-number flex-shrink-0 w-8 h-8 border border-[var(--border)] flex items-center justify-center font-mono text-[10px] text-[var(--accent-teal)]">
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
