import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, Lock, Activity, ArrowRight, GitBranch } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F0EBE3] overflow-hidden selection:bg-teal-500/30">
      {/* Animated Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00A19B] opacity-[0.08] blur-[120px] animate-float rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#7B61FF] opacity-[0.08] blur-[120px] animate-float-reverse rounded-full pointer-events-none" />

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center pt-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,161,155,0.15),transparent)] pointer-events-none" />
        
        <h1 className="text-8xl md:text-[120px] font-cormorant italic uppercase tracking-[0.1em] mb-6 animate-fade-up">
          Leashd
        </h1>
        
        <p className="text-lg md:text-xl font-light text-[#F0EBE3]/45 max-w-2xl mb-12 animate-fade-up [animation-delay:0.1s]">
          The guardrail layer for autonomous AI agents. Secure your vault with on-chain policies and real-time monitoring.
        </p>

        <div className="flex flex-col md:flex-row gap-6 animate-fade-up [animation-delay:0.2s]">
          <Link to="/dashboard" className="btn-primary flex items-center gap-2 text-lg">
            Launch App <ArrowRight className="w-5 h-5" />
          </Link>
          <a href="https://github.com/akxh5/leashd" target="_blank" rel="noreferrer" className="btn-secondary flex items-center gap-2 text-lg">
            View on GitHub <GitBranch className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { step: "01", title: "Deploy", desc: "Deploy a policy-enforced vault for your agent on Solana." },
            { step: "02", title: "Configure", desc: "Set spending limits, allowlists, and cooldown periods." },
            { step: "03", title: "Monitor", desc: "Watch every agent transaction in real-time on your dashboard." }
          ].map((item, i) => (
            <div key={i} className="leashd-card p-10 relative overflow-hidden group animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="absolute top-0 left-0 w-full h-1 bg-[#00A19B]/30 group-hover:bg-[#00A19B] transition-colors" />
              <span className="font-cormorant text-4xl italic text-[#00A19B]/40 mb-6 block">{item.step}</span>
              <h3 className="font-cormorant text-2xl italic uppercase tracking-widest mb-4">{item.title}</h3>
              <p className="text-[#F0EBE3]/45 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6 bg-[#0F0F1A]/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
          {[
            { icon: <Zap className="w-6 h-6" />, title: "Spending Limits", desc: "Set maximum SOL per transaction and rolling daily thresholds to prevent wallet draining." },
            { icon: <Shield className="w-6 h-6" />, title: "Allowlist Enforcement", desc: "Restrict recipients to pre-approved addresses. Agents can never send funds to unknown wallets." },
            { icon: <Lock className="w-6 h-6" />, title: "Cooldown Protection", desc: "Enforce mandatory waiting periods between transactions to slow down rapid attacks." },
            { icon: <Activity className="w-6 h-6" />, title: "Emergency Kill Switch", desc: "Instant owner-only override to freeze all agent activity with a single click." }
          ].map((f, i) => (
            <div key={i} className="flex gap-6 items-start">
              <div className="p-3 bg-[#00A19B]/10 rounded-xl text-[#00A19B] shrink-0">
                {f.icon}
              </div>
              <div>
                <h4 className="text-xl font-medium mb-2">{f.title}</h4>
                <p className="text-[#F0EBE3]/45 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-40 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[#00A19B]/5 blur-[100px]" />
        <h2 className="text-5xl md:text-7xl font-cormorant italic uppercase tracking-widest mb-12 relative z-10">
          Ready to leash your agent?
        </h2>
        <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2 text-xl relative z-10 px-12 py-5">
          Launch App <ArrowRight className="w-6 h-6" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 max-w-7xl mx-auto">
        <div className="font-cormorant text-2xl italic uppercase tracking-[0.2em]">Leashd</div>
        <div className="flex items-center gap-2 text-sm font-medium text-[#F0EBE3]/45">
          Built on <span className="text-[#9945FF]">Solana</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
