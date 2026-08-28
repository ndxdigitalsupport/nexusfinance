import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LoanApplication } from '../types';
import { Printer, X, FileText } from 'lucide-react';
import { apiFetch } from '../api';
import KhmerContractPrint from './KhmerContractPrint';

interface AmortizationScheduleModalProps {
  loan: LoanApplication | null;
  onClose: () => void;
}

export default function AmortizationScheduleModal({ loan, onClose }: AmortizationScheduleModalProps) {
  if (!loan) return null;

  const [scheduleInstallments, setScheduleInstallments] = useState<any[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [isPrintingContract, setIsPrintingContract] = useState(false);

  useEffect(() => {
    setScheduleLoading(true);
    apiFetch(`/loans/${encodeURIComponent(loan.id)}/schedule`)
      .then((data: any) => {
        if (Array.isArray(data) && data.length > 0) {
          setScheduleInstallments(data);
        } else {
          // Fallback to local calculation if table is empty
          const term = loan.durationMonths || 12;
          const defaultMonthlyRepayment = (loan.amount / term) + (loan.amount * 0.015);
          const monthlyPayment = loan.monthlyPayment || defaultMonthlyRepayment;
          const interestPerMonth = Math.max(0, monthlyPayment - (loan.amount / term));
          const principalPerMonth = Math.round((loan.amount / term) * 100) / 100;
          
          const rows = [];
          let balance = loan.amount;
          for (let i = 1; i <= term; i++) {
            let currentPrincipal = principalPerMonth;
            if (i === term) {
              currentPrincipal = Math.round(balance * 100) / 100;
            }
            balance -= currentPrincipal;
            
            // Increment due date by month
            const dueDate = new Date(loan.date);
            dueDate.setMonth(dueDate.getMonth() + i);

            rows.push({
              installment_no: i,
              due_date: dueDate.toISOString(),
              interest_amount: interestPerMonth,
              principal_amount: currentPrincipal,
              total_payment: monthlyPayment,
              remaining_balance: Math.max(0, balance),
              status: 'unpaid'
            });
          }
          setScheduleInstallments(rows);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch schedule, fallback to calculation:', err);
      })
      .finally(() => {
        setScheduleLoading(false);
      });
  }, [loan]);

  const formatDateStr = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const printAmortizationSchedule = () => {
    window.print();
  };

  const handlePrintKhmerContract = () => {
    setIsPrintingContract(true);
  };

  // Split installments into chunks of up to 12 rows per page for clean, repeatable print templates
  const printChunks: any[][] = [];
  for (let i = 0; i < scheduleInstallments.length; i += 12) {
    printChunks.push(scheduleInstallments.slice(i, i + 12));
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/65 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto select-none no-print-backdrop print-portal-wrapper">
      
      {/* Scoped print CSS injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Completely hide main application to remove blank starting pages */
          #root {
            display: none !important;
          }
          body {
            visibility: visible !important;
            background: white !important;
          }
          /* Prevent layout wrapper page-cuts and clear height restrictions */
          html, body, .printable-scheduler-sheet, #print-schedule-modal, .printable-content-block, .print-portal-wrapper {
            height: auto !important;
            min-height: auto !important;
            max-height: none !important;
            overflow: visible !important;
            display: block !important;
            position: relative !important;
          }
          .print-portal-wrapper {
            background: transparent !important;
            padding: 0 !important;
            z-index: auto !important;
          }
          .printable-content-block {
            padding: 0 !important;
            margin: 0 !important;
          }
          /* Force two-column layout only on metadata info grid card in print */
          .printable-scheduler-sheet .printable-metadata-grid {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 12px 24px !important;
          }
          /* Keep signature boxes in 3 columns side-by-side */
          .printable-scheduler-sheet .print-signature-grid {
            display: grid !important;
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 12px 24px !important;
          }
          /* Expose printable sheet and its contents cleanly */
          .printable-scheduler-sheet {
            visibility: visible;
            position: relative !important;
            width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .printable-scheduler-sheet * {
            visibility: visible;
            color: black !important; /* Force high-contrast black print graphics/texts */
          }
          .no-print {
            display: none !important;
          }
          .print-page {
            page-break-after: always !important;
            break-after: always !important;
            box-sizing: border-box !important;
            padding: 20px 0 !important;
          }
          .print-page:last-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          /* Avoid breaking table rows across pages */
          tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          /* Dynamic toggles: hide schedule modal entirely if printing contract */
          #print-schedule-modal.is-printing-contract-active {
            display: none !important;
          }
          /* Dynamic toggles: hide contract print pages if printing schedule */
          #print-schedule-modal:not(.is-printing-contract-active) ~ .printable-contract-container {
            display: none !important;
          }
        }
      `}} />

      <div id="print-schedule-modal" className={`bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 printable-scheduler-sheet flex flex-col my-8 ${isPrintingContract ? 'is-printing-contract-active' : ''}`}>
        
        {/* Modal Header */}
        <div className="px-8 py-5 border-b border-[var(--border-primary)] bg-[var(--surface-secondary)]/30 flex justify-between items-center no-print">
          <div>
            <h3 className="text-[17px] font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <Printer className="w-5 h-5 text-[var(--accent)]" />
              <span>Loan Amortization Schedule</span>
            </h3>
            <p className="text-[12px] text-[var(--text-secondary)] font-medium mt-1">
              Database pre-calculated installments tracker.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Content Block */}
        <div className="p-8 space-y-6 flex-1 overflow-y-auto printable-content-block">
          
          {/* ── SCREEN ONLY CONTAINER ── */}
          <div className="space-y-6 no-print">
            {/* Print Title Block */}
            <div className="text-center pb-4 border-b-2 border-dashed border-[var(--border-primary)]">
              <h2 className="text-2xl font-black tracking-tight" style={{ color: '#0d9488' }}>NexusFinance</h2>
              <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-widest mt-1">Payment Schedule</p>
            </div>

            {/* Info Fields Grid (Figma style) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4 p-5 rounded-2xl border border-[var(--border-primary)] bg-[var(--surface-secondary)]/20 printable-metadata-grid">
              <div className="text-xs font-medium text-[var(--text-secondary)]">
                Borrower Name: <span className="font-bold text-[var(--text-primary)] ml-1">{loan.applicantName}</span>
              </div>
              <div className="text-xs font-medium text-[var(--text-secondary)]">
                Application No: <span className="font-bold text-[var(--text-primary)] ml-1">{loan.id}</span>
              </div>
              <div className="text-xs font-medium text-[var(--text-secondary)]">
                Reference No: <span className="font-bold text-[var(--text-primary)] ml-1">REF-{loan.id.replace('#', '')}</span>
              </div>
              <div className="text-xs font-medium text-[var(--text-secondary)]">
                Loan Amount: <span className="font-bold text-[var(--text-primary)] ml-1">${loan.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="text-xs font-medium text-[var(--text-secondary)]">
                Term: <span className="font-bold text-[var(--text-primary)] ml-1">{loan.durationMonths || 12} Months</span>
              </div>
              <div className="text-xs font-medium text-[var(--text-secondary)]">
                Repayment Freq: <span className="font-bold text-[var(--text-primary)] ml-1">Monthly (30d)</span>
              </div>
              <div className="text-xs font-medium text-[var(--text-secondary)]">
                Disbursed Date: <span className="font-bold text-[var(--text-primary)] ml-1">{formatDateStr(loan.date)}</span>
              </div>
              <div className="text-xs font-medium text-[var(--text-secondary)]">
                Borrower Phone: <span className="font-bold text-[var(--text-primary)] ml-1">{(loan as any).applicantPhone || (loan as any).phone || loan.applicantEmail.split('@')[0]}</span>
              </div>
            </div>

            {scheduleLoading ? (
              <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
                <div className="w-8 h-8 rounded-full border-4 border-t-[var(--accent)] border-[var(--border-primary)] animate-spin" />
                <p className="text-xs text-[var(--text-secondary)] font-bold">Querying ledger records...</p>
              </div>
            ) : (
              /* Schedule Table */
              <div className="overflow-x-auto border border-[var(--border-primary)] rounded-2xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[var(--surface-secondary)] text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)] border-b border-[var(--border-primary)]">
                      <th className="px-5 py-3 text-center w-12">N*</th>
                      <th className="px-5 py-3">Due Date</th>
                      <th className="px-5 py-3 text-right">Interest</th>
                      <th className="px-5 py-3 text-right">Principal</th>
                      <th className="px-5 py-3 text-right">Payment</th>
                      <th className="px-5 py-3 text-right">Balance</th>
                      <th className="px-5 py-3 text-center no-print">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-secondary)] text-[13px] text-[var(--text-primary)]">
                    {scheduleInstallments.map((row: any) => {
                      const isPaid = row.status === 'paid' || row.status === 'Paid';
                      const isOverdue = row.status === 'overdue' || row.status === 'Overdue';
                      
                      return (
                        <tr key={row.installment_no} className="hover:bg-[var(--surface-secondary)]/10">
                          <td className="px-5 py-3 text-center font-bold text-[var(--text-secondary)]">{row.installment_no}</td>
                          <td className="px-5 py-3 font-semibold">{formatDateStr(row.due_date)}</td>
                          <td className="px-5 py-3 text-right text-[var(--text-secondary)]">${Number(row.interest_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="px-5 py-3 text-right">${Number(row.principal_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="px-5 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">${Number(row.total_payment).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="px-5 py-3 text-right font-semibold">${Number(row.remaining_balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="px-5 py-3 text-center no-print">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              isPaid 
                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                                : isOverdue 
                                ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)] border border-[var(--border-primary)]'
                            }`}>
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── PRINT ONLY PAGINATED CONTAINER ── */}
          <div className="hidden print:block space-y-8 schedule-print-only-block">
            {printChunks.map((chunk, chunkIdx) => {
              const isLastPage = chunkIdx === printChunks.length - 1;
              
              return (
                <div key={chunkIdx} className="print-page space-y-6">
                  
                  {/* Title block on every page */}
                  <div className="text-center pb-4 border-b-2 border-dashed border-gray-300">
                    <h2 className="text-2xl font-black tracking-tight" style={{ color: '#0d9488' }}>NexusFinance</h2>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-1">Payment Schedule (Page {chunkIdx + 1} of {printChunks.length})</p>
                  </div>

                  {/* Metadata grid on every page */}
                  <div className="grid grid-cols-2 gap-4 p-5 rounded-2xl border border-gray-200 bg-gray-50/50 printable-metadata-grid">
                    <div className="text-xs font-semibold text-gray-600">
                      Borrower Name: <span className="font-bold text-gray-900 ml-1">{loan.applicantName}</span>
                    </div>
                    <div className="text-xs font-semibold text-gray-600">
                      Application No: <span className="font-bold text-gray-900 ml-1">{loan.id}</span>
                    </div>
                    <div className="text-xs font-semibold text-gray-600">
                      Reference No: <span className="font-bold text-gray-900 ml-1">REF-{loan.id.replace('#', '')}</span>
                    </div>
                    <div className="text-xs font-semibold text-gray-600">
                      Loan Amount: <span className="font-bold text-gray-900 ml-1">${loan.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="text-xs font-semibold text-gray-600">
                      Term: <span className="font-bold text-gray-900 ml-1">{loan.durationMonths || 12} Months</span>
                    </div>
                    <div className="text-xs font-semibold text-gray-600">
                      Repayment Freq: <span className="font-bold text-gray-900 ml-1">Monthly (30d)</span>
                    </div>
                    <div className="text-xs font-semibold text-gray-600">
                      Disbursed Date: <span className="font-bold text-gray-900 ml-1">{formatDateStr(loan.date)}</span>
                    </div>
                    <div className="text-xs font-semibold text-gray-600">
                      Borrower Phone: <span className="font-bold text-gray-900 ml-1">{(loan as any).applicantPhone || (loan as any).phone || loan.applicantEmail.split('@')[0]}</span>
                    </div>
                  </div>

                  {/* Chunk schedule table */}
                  <div className="overflow-x-auto border border-gray-300 rounded-2xl">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-100 text-[11px] font-extrabold uppercase tracking-wider text-gray-500 border-b border-gray-300">
                          <th className="px-5 py-3 text-center w-12">N*</th>
                          <th className="px-5 py-3">Due Date</th>
                          <th className="px-5 py-3 text-right">Interest</th>
                          <th className="px-5 py-3 text-right">Principal</th>
                          <th className="px-5 py-3 text-right">Payment</th>
                          <th className="px-5 py-3 text-right">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 text-[13px] text-gray-800">
                        {chunk.map((row: any) => (
                          <tr key={row.installment_no} className="hover:bg-gray-50">
                            <td className="px-5 py-3 text-center font-bold text-gray-500">{row.installment_no}</td>
                            <td className="px-5 py-3 font-semibold">{formatDateStr(row.due_date)}</td>
                            <td className="px-5 py-3 text-right text-gray-500">${Number(row.interest_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="px-5 py-3 text-right">${Number(row.principal_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="px-5 py-3 text-right font-bold text-emerald-600">${Number(row.total_payment).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="px-5 py-3 text-right font-semibold">${Number(row.remaining_balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Signature Boxes at the bottom of the final printed page */}
                  {isLastPage && (
                    <div className="grid grid-cols-3 gap-12 pt-12 text-center text-xs font-bold text-gray-700 print-signature-grid">
                      <div className="space-y-12">
                        <div className="border-t border-gray-400 pt-2">Contractor Signature</div>
                      </div>
                      <div className="space-y-12">
                        <div className="border-t border-gray-400 pt-2">Witness Signature</div>
                      </div>
                      <div className="space-y-12">
                        <div className="border-t border-gray-400 pt-2">Borrower Signature</div>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-8 py-4 border-t border-[var(--border-primary)] bg-[var(--surface-secondary)]/30 flex justify-end gap-3 no-print">
          <button
            onClick={onClose}
            className="py-2.5 px-4 text-[12.5px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrintKhmerContract}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-[12.5px] font-bold shadow-md hover:brightness-105 active:scale-97 cursor-pointer flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>Print Khmer Contract</span>
          </button>
          <button
            disabled={scheduleLoading || scheduleInstallments.length === 0}
            onClick={printAmortizationSchedule}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[12.5px] font-bold shadow-md hover:brightness-105 active:scale-97 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            <span>Print Schedule</span>
          </button>
        </div>

      </div>

      {isPrintingContract && (
        <KhmerContractPrint 
          application={loan} 
          onClose={() => setIsPrintingContract(false)} 
        />
      )}

    </div>
    , document.body);
}
