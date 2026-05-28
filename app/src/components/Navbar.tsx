import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { motion } from 'framer-motion';

export const Navbar = () => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-8 md:px-12"
      style={{
        background: 'rgba(10,10,15,0.6)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}
    >
      {/* Left: Logo */}
      <div className="flex items-center gap-2">
        <span style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: 'italic',
          fontSize: '22px',
          color: '#F0EBE3',
          letterSpacing: '-0.01em'
        }}>
          leashd
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#00A19B] animate-pulse" />
      </div>

      {/* Center: Links */}
      <div className="hidden md:flex items-center gap-10">
        {['Overview', 'Guardrails', 'App'].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            className="text-sm transition-colors duration-150 font-sans"
            style={{ color: 'rgba(240,235,227,0.5)' }}
            onMouseEnter={e => (e.target as HTMLElement).style.color = '#F0EBE3'}
            onMouseLeave={e => (e.target as HTMLElement).style.color = 'rgba(240,235,227,0.5)'}
          >
            {item}
          </a>
        ))}
      </div>

      {/* Right: Wallet button */}
      <div className="wallet-button-wrapper" style={{
        border: '1px solid rgba(0,161,155,0.3)',
        borderRadius: '8px',
        padding: '2px'
      }}>
        <WalletMultiButton />
      </div>
    </motion.nav>
  );
};
