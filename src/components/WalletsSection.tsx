import React from 'react';
import Heading from './Heading';
import { formatCurrency } from '../utils';

interface Props { walletBalance: number; outstandingBalance: number; }

export default function WalletsSection({ walletBalance, outstandingBalance }: Props) {
  return (
    <div className="animate-content-enter">
      <Heading>Wallets</Heading>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl p-8">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Vault Wallet</p>
          <p className="text-[36px] font-extrabold text-[var(--text-primary)] mt-2">{formatCurrency(walletBalance)}</p>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1">Primary checking & savings</p>
        </div>
        <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl p-8">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Outstanding Balance</p>
          <p className="text-[36px] font-extrabold text-[var(--text-primary)] mt-2">{formatCurrency(outstandingBalance)}</p>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1">Total credit in use</p>
        </div>
      </div>
    </div>
  );
}
