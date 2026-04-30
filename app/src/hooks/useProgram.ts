import { useMemo } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorProvider, Program, Idl } from '@coral-xyz/anchor';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import idl from '../idl/agent_wallet.json';

export const useProgram = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const program = useMemo(() => {
    if (!wallet) return null;

    const provider = new AnchorProvider(connection, wallet, {
      preflightCommitment: 'processed',
    });

    return new Program(idl as Idl, provider);
  }, [connection, wallet]);

  return program;
};
