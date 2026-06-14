import { CurrencyCode, EXCHANGE_RATE_KHR } from './types';

export function downloadCSV(data: Record<string, any>[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(h => {
    const val = row[h];
    const str = val == null ? '' : String(val);
    return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str.replace(/"/g, '""')}"` : str;
  }));
  const csv = [headers.join(','), ...rows.join('\n')].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function getCurrency(): CurrencyCode {
  return (localStorage.getItem('nexus_currency') as CurrencyCode) || 'USD';
}

export function setCurrency(c: CurrencyCode) {
  localStorage.setItem('nexus_currency', c);
}

export function formatCurrency(amount: number, currency?: CurrencyCode): string {
  const c = currency || getCurrency();
  if (c === 'KHR') {
    const khr = Math.round(amount * EXCHANGE_RATE_KHR);
    return `៛${khr.toLocaleString()}`;
  }
  return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatCurrencyShort(amount: number, currency?: CurrencyCode): string {
  const c = currency || getCurrency();
  if (c === 'KHR') {
    const khr = Math.round(amount * EXCHANGE_RATE_KHR);
    if (khr >= 1000000) return `៛${(khr / 1000000).toFixed(1)}M`;
    if (khr >= 1000) return `៛${(khr / 1000).toFixed(0)}K`;
    return `៛${khr}`;
  }
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount.toFixed(0)}`;
}
