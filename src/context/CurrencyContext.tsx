import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CurrencyCode, EXCHANGE_RATE_KHR } from '../types';

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  formatCurrency: (amount: number) => string;
  formatCurrencyShort: (amount: number) => string;
  exchangeRate: number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem('nexus_currency');
    return (saved as CurrencyCode) || 'USD';
  });

  const setCurrency = useCallback((c: CurrencyCode) => {
    localStorage.setItem('nexus_currency', c);
    setCurrencyState(c);
    window.dispatchEvent(new StorageEvent('storage', { key: 'nexus_currency', newValue: c }));
  }, []);

  const formatCurrency = useCallback((amount: number) => {
    if (currency === 'KHR') {
      const khr = Math.round(amount * EXCHANGE_RATE_KHR);
      return `៛${khr.toLocaleString()}`;
    }
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [currency]);

  const formatCurrencyShort = useCallback((amount: number) => {
    if (currency === 'KHR') {
      const khr = Math.round(amount * EXCHANGE_RATE_KHR);
      if (khr >= 1000000) return `៛${(khr / 1000000).toFixed(1)}M`;
      if (khr >= 1000) return `៛${(khr / 1000).toFixed(0)}K`;
      return `៛${khr}`;
    }
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount.toFixed(0)}`;
  }, [currency]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency, formatCurrencyShort, exchangeRate: EXCHANGE_RATE_KHR }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
