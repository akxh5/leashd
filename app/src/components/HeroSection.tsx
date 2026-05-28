import React from 'react';
import { motion } from 'framer-motion';
import { Lightning } from './ui/lightning';

export const HeroSection = () => {
  return (
    <section id="hero" className="relative w-full min-h-[100dvh] flex flex-col overflow-hidden bg-[#0A0A0F] pt-16">
      
      {/* Lightning background — full bleed */}
      <div className="absolute inset-0 z-0">
        <Lightning
          hue={174}
          xOffset={0}
          speed={1.4}
          intensity={0.9}
          size={2.5}
        />
      </div>

      {/* Second lightning — offset right, purple tint */}
      <div className="absolute inset-0 z-0 opacity-40">
        <Lightning
          hue={260}
          xOffset={0.8}
          speed={1.0}
          intensity={0.5}
          size={3}
        />
      </div>

      {/* Dark overlay — keeps text readable */}
      <div className="absolute inset-0 z-10 
        bg-gradient-to-b from-[#0A0A0F]/30 via-transparent 
        to-[#0A0A0F]" />

      {/* Radial glow at center */}
      <div className="absolute inset-0 z-10 
        bg-[radial-gradient(ellipse_60%_40%_at_50%_60%,
        rgba(0,161,155,0.08),transparent)]" />

      {/* All existing hero content — wrap in relative z-20 */}
      <div className="relative z-20 flex flex-col min-h-screen px-6 pt-20 items-center justify-center">
        <div className="max-w-[1400px] w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-12">
            <div className="space-y-6">
              <motion.h1 
                className="text-[120px] leading-[0.9] italic tracking-tighter text-[var(--text-primary)]"
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                leashd
              </motion.h1>
              <motion.p 
                className="text-2xl font-light text-[var(--text-secondary)] max-w-lg leading-relaxed"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              >
                On-chain guardrails for autonomous AI agents.
              </motion.p>
            </div>

            <motion.p 
              className="text-[15px] text-[var(--text-muted)] max-w-lg leading-relaxed"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              AI agents are about to control money at scale. Leashd enforces spending limits and kill switches at the contract level.
            </motion.p>

            <motion.div 
              className="flex gap-6"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <button 
                onClick={() => document.getElementById('app')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-[#00A19B] text-[#0A0A0F] font-semibold tracking-[0.02em] px-8 py-[14px] rounded-[8px] shadow-[0_0_32px_rgba(0,161,155,0.3)] hover:shadow-[0_0_48px_rgba(0,161,155,0.5)] hover:-translate-y-[1px] transition-all duration-200"
              >
                Launch app
              </button>
            </motion.div>
          </div>

          <div className="space-y-4">
            {[
              { label: "Max transaction", value: "Locked on-chain", color: "#00A19B" },
              { label: "Daily limit", value: "24h Window", color: "#7B61FF" },
              { label: "Allowlist", value: "Enforced", color: "#00A19B" },
              { label: "Kill switch", value: "Instant", color: "#FF4560" }
            ].map((item, i) => (
              <motion.div 
                key={i} 
                className="flex items-center justify-between p-8 border-l border-[rgba(0,161,155,0.2)] bg-[rgba(0,161,155,0.03)] hover:border-[rgba(0,161,155,0.6)] hover:translate-x-1 transition-all duration-200"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * i }}
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
                  className={`w-2 h-2 rounded-full ${i === 3 ? 'animate-pulse-red' : 'animate-pulse-teal'}`} 
                  style={{ backgroundColor: item.color }}
                ></div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <span className="text-xs text-[#F0EBE3]/30 tracking-widest uppercase font-mono">scroll</span>
        <motion.div
          className="w-px h-8 bg-gradient-to-b from-[#00A19B]/60 to-transparent origin-top"
          animate={{ scaleY: [1, 0.3, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
};
