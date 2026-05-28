import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Shield, Zap, Lock, Activity } from 'lucide-react';

export const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      
      tl.from(titleRef.current, {
        y: 60,
        opacity: 0,
        duration: 1.2,
        ease: 'power4.out',
      })
      .from('.hero-subcopy', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out',
      }, '-=0.8')
      .from('.guardrail-card', {
        scale: 0.95,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: 'back.out(1.7)',
      }, '-=0.5');

      // Subtle float animation for cards
      gsap.to('.guardrail-card', {
        y: -10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        stagger: {
          each: 0.2,
          from: 'random'
        },
        ease: 'sine.inOut'
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="hero" ref={containerRef} className="min-h-screen flex flex-col items-center justify-center px-6 pt-20 overflow-hidden relative">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(var(--text-muted) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

      <div className="max-w-[1400px] w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-12">
          <div className="space-y-6">
            <h1 ref={titleRef} className="text-[120px] leading-[0.9] italic tracking-tighter text-[var(--accent-teal)]">
              leashd
            </h1>
            <p className="hero-subcopy text-2xl font-light text-[var(--text-secondary)] max-w-lg leading-relaxed">
              On-chain guardrails for autonomous AI agents.
            </p>
          </div>

          <p className="hero-subcopy text-lg text-[var(--text-muted)] max-w-xl leading-relaxed">
            AI agents are about to control money at scale. Leashd enforces spending limits, allowlists, and kill switches at the smart contract level — rules the agent cannot bypass.
          </p>

          <div className="hero-subcopy flex gap-6">
            <button 
              onClick={() => document.getElementById('app')?.scrollIntoView({ behavior: 'smooth' })}
              className="leashd-button-primary text-[14px] px-10 py-5"
            >
              Launch App →
            </button>
          </div>
        </div>

        <div ref={cardsRef} className="space-y-4">
          {[
            { label: "Max Transaction", value: "Locked on-chain", color: "var(--accent-teal)" },
            { label: "Daily Limit", value: "24h Window", color: "var(--accent-purple)" },
            { label: "Allowlist", value: "Enforced", color: "var(--accent-teal)" },
            { label: "Kill Switch", value: "Instant", color: "var(--danger)" }
          ].map((item, i) => (
            <div 
              key={i} 
              className="guardrail-card flex items-center justify-between p-8 border-b border-[var(--border)] hover:bg-[var(--bg-surface)] transition-colors group"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors">
                  {item.label}
                </span>
                <p className="text-2xl italic text-[var(--text-primary)] font-serif uppercase tracking-tight">
                  {item.value}
                </p>
              </div>
              <div 
                className="w-1.5 h-1.5 rounded-full" 
                style={{ backgroundColor: item.color, boxShadow: `0 0 15px ${item.color}` }}
              ></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
