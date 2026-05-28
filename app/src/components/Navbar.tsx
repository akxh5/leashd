import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export const Navbar = () => {
  const { publicKey } = useWallet();

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-[100] border-b border-[var(--border)] bg-[var(--bg-base)]/80 backdrop-blur-md">
      <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <button 
            onClick={() => scrollTo('hero')}
            className="text-3xl italic font-serif text-[var(--text-primary)] hover:opacity-80 transition-opacity tracking-widest"
          >
            leashd
            <span className="inline-block w-1.5 h-1.5 bg-[var(--accent-teal)] rounded-full ml-1 mb-1"></span>
          </button>
          
          <div className="hidden md:flex items-center gap-8">
            {['overview', 'guardrails', 'app'].map((item) => (
              <button
                key={item}
                onClick={() => scrollTo(item)}
                className="text-[12px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors capitalize"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <WalletMultiButton className="!bg-[var(--bg-surface)] !border !border-[var(--border)] !rounded-none !h-10 !px-6 !text-[12px] !font-medium !transition-colors hover:!border-[var(--border-hover)]" />
        </div>
      </div>
    </nav>
  );
};
