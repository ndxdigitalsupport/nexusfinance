import React, { useState } from 'react';
import { Calculator, DollarSign, Percent, Calendar } from 'lucide-react';
import Heading from './Heading';

function amortize(principal: number, annualRate: number, months: number) {
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return { monthly: principal / months, totalInterest: 0, totalPayment: principal, schedule: [] };
  const factor = Math.pow(1 + monthlyRate, months);
  const monthly = principal * (monthlyRate * factor) / (factor - 1);
  const totalPayment = monthly * months;
  const totalInterest = totalPayment - principal;

  const schedule = [];
  let balance = principal;
  for (let i = 1; i <= months; i++) {
    const interest = balance * monthlyRate;
    const principalPaid = monthly - interest;
    balance -= principalPaid;
    schedule.push({ month: i, payment: monthly, principal: principalPaid, interest, balance: Math.max(0, balance) });
  }
  return { monthly, totalInterest, totalPayment, schedule };
}

const formatUSD = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function LoanCalculator() {
  const [amount, setAmount] = useState(10000);
  const [rate, setRate] = useState(5.4);
  const [term, setTerm] = useState(24);
  const [showSchedule, setShowSchedule] = useState(false);

  const { monthly, totalInterest, totalPayment, schedule } = amortize(amount, rate, term);

  return (
    <div className="animate-content-enter">
      <Heading>Loan Calculator</Heading>
      <p className="text-[13px] text-[var(--text-secondary)] mt-1 mb-6">Estimate monthly payments, total interest, and view a full amortization schedule.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl p-6 space-y-6">
          <div>
            <label className="flex items-center justify-between text-[13px] font-bold text-[var(--text-primary)] mb-2">
              <span><DollarSign className="w-3.5 h-3.5 inline" /> Loan Amount</span>
              <span className="text-[var(--accent)]">${amount.toLocaleString()}</span>
            </label>
            <input type="range" min={1000} max={500000} step={1000} value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full accent-[var(--accent)] cursor-pointer" />
            <div className="flex justify-between text-[11px] text-[var(--text-tertiary)] mt-1">
              <span>$1,000</span>
              <span>$500,000</span>
            </div>
          </div>

          <div>
            <label className="flex items-center justify-between text-[13px] font-bold text-[var(--text-primary)] mb-2">
              <span><Percent className="w-3.5 h-3.5 inline" /> Interest Rate</span>
              <span className="text-[var(--accent)]">{rate}%</span>
            </label>
            <input type="range" min={1} max={30} step={0.1} value={rate} onChange={e => setRate(Number(e.target.value))} className="w-full accent-[var(--accent)] cursor-pointer" />
            <div className="flex justify-between text-[11px] text-[var(--text-tertiary)] mt-1">
              <span>1%</span>
              <span>30%</span>
            </div>
          </div>

          <div>
            <label className="flex items-center justify-between text-[13px] font-bold text-[var(--text-primary)] mb-2">
              <span><Calendar className="w-3.5 h-3.5 inline" /> Loan Term</span>
              <span className="text-[var(--accent)]">{term} months ({Math.floor(term / 12)}y {term % 12}m)</span>
            </label>
            <input type="range" min={3} max={360} step={1} value={term} onChange={e => setTerm(Number(e.target.value))} className="w-full accent-[var(--accent)] cursor-pointer" />
            <div className="flex justify-between text-[11px] text-[var(--text-tertiary)] mt-1">
              <span>3 months</span>
              <span>360 months</span>
            </div>
          </div>
        </div>

        <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl p-6 flex flex-col justify-center">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Monthly Payment</p>
          <p className="text-[42px] font-extrabold text-[var(--text-primary)] mt-1">${formatUSD(monthly)}</p>
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-[var(--border-primary)]">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Total Interest</p>
              <p className="text-[20px] font-extrabold text-[var(--error-text)] mt-1">${formatUSD(totalInterest)}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Total Payment</p>
              <p className="text-[20px] font-extrabold text-[var(--text-primary)] mt-1">${formatUSD(totalPayment)}</p>
            </div>
          </div>
          <button onClick={() => setShowSchedule(!showSchedule)} className="mt-6 text-[13px] font-bold text-[var(--accent)] hover:underline text-left cursor-pointer">
            {showSchedule ? 'Hide' : 'Show'} Amortization Schedule
          </button>
        </div>
      </div>

      {showSchedule && (
        <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl mt-6 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--surface-secondary)] text-[11px] uppercase tracking-wider text-[var(--text-secondary)] font-bold sticky top-0">
                <th className="px-4 py-3">Month</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Principal</th>
                <th className="px-4 py-3">Interest</th>
                <th className="px-4 py-3">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-primary)]">
              {schedule.slice(0, showSchedule ? schedule.length : 12).map((row) => (
                <tr key={row.month} className="text-[13px] font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]/70 transition-colors">
                  <td className="px-4 py-2.5 text-[var(--text-secondary)]">{row.month}</td>
                  <td className="px-4 py-2.5">${formatUSD(row.payment)}</td>
                  <td className="px-4 py-2.5">${formatUSD(row.principal)}</td>
                  <td className="px-4 py-2.5">${formatUSD(row.interest)}</td>
                  <td className="px-4 py-2.5">${formatUSD(row.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-3 text-center text-[12px] text-[var(--text-secondary)] font-semibold border-t border-[var(--border-primary)]">
            {schedule.length > 12 && !showSchedule && (
              <button onClick={() => setShowSchedule(true)} className="text-[var(--accent)] hover:underline cursor-pointer">Show all {schedule.length} months</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
