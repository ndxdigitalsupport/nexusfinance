import React, { useState, useMemo } from 'react';
import { LoanApplication, Transaction } from '../types';
import { Download, Printer, Search, Calendar, Landmark, Receipt, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

interface ReportsViewProps {
  activeReport: string;
  loans: LoanApplication[];
  transactions: Transaction[];
  onViewSchedule: (loan: LoanApplication) => void;
}

export default function ReportsView({ activeReport, loans, transactions, onViewSchedule }: ReportsViewProps) {
  const { formatCurrency } = useCurrency();

  // Search & Date states
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Human readable date formatter helper
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // 1. Filtered Data Calculations
  const reportsData = useMemo(() => {
    const sDate = startDate ? new Date(startDate) : null;
    const eDate = endDate ? new Date(endDate) : null;

    // Helper to check date range
    const isWithinDate = (dateStr: string) => {
      if (!dateStr) return true;
      const d = new Date(dateStr);
      if (sDate && d < sDate) return false;
      if (eDate && d > eDate) return false;
      return true;
    };

    switch (activeReport) {
      case 'report_outstanding': {
        // Active loans (Approved) that are not fully paid
        return loans
          .filter(loan => {
            if (loan.status !== 'Approved' || loan.repaymentStatus === 'Paid') return false;
            
            // Search filter
            const matchesSearch = 
              loan.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              loan.applicantEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
              loan.id.toLowerCase().includes(searchTerm.toLowerCase());
            
            return matchesSearch && isWithinDate(loan.date);
          })
          .map(loan => {
            // Find total repaid for this loan
            const repayments = transactions.filter(t => 
              t.type === 'Repayment' && 
              t.title.toLowerCase().includes(loan.applicantName.toLowerCase())
            );
            const totalRepaid = Math.abs(repayments.reduce((sum, r) => sum + r.amount, 0));
            const outstanding = Math.max(0, loan.amount - totalRepaid);
            
            return {
              ...loan,
              totalRepaid,
              outstanding
            };
          });
      }

      case 'report_payments': {
        // Repayment transactions log
        return transactions
          .filter(tx => {
            if (tx.type !== 'Repayment') return false;

            const matchesSearch = 
              tx.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              tx.id.toLowerCase().includes(searchTerm.toLowerCase());

            return matchesSearch && isWithinDate(tx.date);
          });
      }

      case 'report_late': {
        // Overdue active loans
        return loans
          .filter(loan => {
            if (loan.status !== 'Approved' || loan.repaymentStatus !== 'Overdue') return false;

            const matchesSearch = 
              loan.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              loan.id.toLowerCase().includes(searchTerm.toLowerCase());

            return matchesSearch && isWithinDate(loan.date);
          })
          .map(loan => {
            const overdueDays = (loan.overdueCount || 1) * 30; // Estimate 30 days per overdue installment
            const penalty = (loan.overdueCount || 1) * 2000; // 2,000 KHR penalty per late count

            return {
              ...loan,
              overdueDays,
              penalty
            };
          });
      }

      case 'report_paid_off': {
        // Loans that are fully paid
        return loans
          .filter(loan => {
            if (loan.status !== 'Approved' || loan.repaymentStatus !== 'Paid') return false;

            const matchesSearch = 
              loan.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              loan.id.toLowerCase().includes(searchTerm.toLowerCase());

            return matchesSearch && isWithinDate(loan.date);
          });
      }

      default:
        return [];
    }
  }, [activeReport, loans, transactions, searchTerm, startDate, endDate]);

  // Excel / CSV Export
  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (activeReport === 'report_outstanding') {
      csvContent += "Loan ID,Borrower Name,Email,Original Amount,Total Repaid,Outstanding Balance,Term,Status\n";
      reportsData.forEach((row: any) => {
        csvContent += `"${row.id}","${row.applicantName}","${row.applicantEmail}",$${row.amount},$${row.totalRepaid.toFixed(2)},$${row.outstanding.toFixed(2)},"${row.durationMonths} Months","${row.repaymentStatus}"\n`;
      });
    } else if (activeReport === 'report_payments') {
      csvContent += "Transaction ID,Description,Amount,Date,Type\n";
      reportsData.forEach((row: any) => {
        csvContent += `"${row.id}","${row.title}",$${Math.abs(row.amount)},"${row.date}","${row.type}"\n`;
      });
    } else if (activeReport === 'report_late') {
      csvContent += "Loan ID,Borrower Name,Overdue Installments,Estimated Overdue Days,Interest Rate,Next Payment Date,Penalty KHR\n";
      reportsData.forEach((row: any) => {
        csvContent += `"${row.id}","${row.applicantName}",${row.overdueCount || 1},${row.overdueDays},"${row.monthlyPayment ? '1.5%' : 'N/A'}","${row.nextPaymentDate || 'N/A'}",${row.penalty} KHR\n`;
      });
    } else if (activeReport === 'report_paid_off') {
      csvContent += "Loan ID,Borrower Name,Email,Disbursement Amount,Duration Months,Term End Status\n";
      reportsData.forEach((row: any) => {
        csvContent += `"${row.id}","${row.applicantName}","${row.applicantEmail}",$${row.amount},"${row.durationMonths} Months","Paid Off"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `NexusFinance_${activeReport}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF Print Trigger
  const triggerPrint = () => {
    window.print();
  };

  // Titles mapping
  const reportTitles: { [key: string]: { title: string; subtitle: string; color: string; icon: any } } = {
    report_outstanding: {
      title: 'Loan Outstanding Report',
      subtitle: 'Dynamic view of current active accounts and unpaid principal/interest balances.',
      color: 'from-blue-500 to-indigo-600',
      icon: TrendingUp
    },
    report_payments: {
      title: 'Payments Report',
      subtitle: 'Audit log of repayment transaction history and client installment credits.',
      color: 'from-emerald-500 to-teal-600',
      icon: Receipt
    },
    report_late: {
      title: 'Loan Late Report',
      subtitle: 'Delinquency tracker listing accounts behind schedule with accumulated penalties.',
      color: 'from-amber-500 to-orange-600',
      icon: AlertTriangle
    },
    report_paid_off: {
      title: 'Paid Off Report',
      subtitle: 'Settle history recording all loans successfully closed out and completed.',
      color: 'from-purple-500 to-pink-600',
      icon: CheckCircle
    }
  };

  const reportInfo = reportTitles[activeReport] || {
    title: 'Nexus Reports',
    subtitle: 'Manage and audit platform data.',
    color: 'from-slate-500 to-slate-600',
    icon: Landmark
  };

  const ReportIcon = reportInfo.icon;

  return (
    <div className="space-y-6 animate-fade-in print:p-0">
      
      {/* Scoped print media override styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-report-wrapper, .printable-report-wrapper * {
            visibility: visible;
          }
          .printable-report-wrapper {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            color: black !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      {/* Header Banner */}
      <div 
        className="border rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden shadow-xl printable-report-wrapper"
        style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-primary)' }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${reportInfo.color} flex items-center justify-center text-white shadow-lg`}>
            <ReportIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{reportInfo.title}</h2>
            <p className="text-xs mt-1 max-w-xl" style={{ color: 'var(--text-secondary)' }}>{reportInfo.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 z-10 no-print">
          <button
            onClick={exportToCSV}
            className="px-4 py-2.5 bg-[var(--surface-secondary)] hover:brightness-110 text-[var(--text-primary)] border rounded-xl text-[12.5px] font-bold transition flex items-center gap-1.5 cursor-pointer"
            style={{ borderColor: 'var(--border-primary)' }}
          >
            <Download className="w-4 h-4" />
            <span>Excel Export</span>
          </button>
          <button
            onClick={triggerPrint}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-105 text-white rounded-xl text-[12.5px] font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Filters Area */}
      <div 
        className="border rounded-3xl p-5 grid grid-cols-1 md:grid-cols-4 gap-4 no-print"
        style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-primary)' }}
      >
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by borrower, email, or reference..."
            className="w-full border rounded-xl pl-10 pr-4 py-2.5 text-[13px] outline-none transition"
            style={{ backgroundColor: 'var(--surface-primary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
          />
        </div>

        {/* Start Date */}
        <div className="relative">
          <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border rounded-xl pl-10 pr-4 py-2.5 text-[13px] outline-none transition"
            style={{ backgroundColor: 'var(--surface-primary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
          />
        </div>

        {/* End Date */}
        <div className="relative">
          <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border rounded-xl pl-10 pr-4 py-2.5 text-[13px] outline-none transition"
            style={{ backgroundColor: 'var(--surface-primary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {/* Report Tables Wrapper */}
      <div 
        className="border rounded-3xl overflow-hidden shadow-xl printable-report-wrapper"
        style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-primary)' }}
      >
        <div className="overflow-x-auto">
          
          {/* A. Outstanding Report Table */}
          {activeReport === 'report_outstanding' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-[11.5px] uppercase font-bold tracking-wider" style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}>
                  <th className="px-6 py-4">Loan ID</th>
                  <th className="px-6 py-4">Borrower</th>
                  <th className="px-6 py-4">Original Amount</th>
                  <th className="px-6 py-4">Total Repaid</th>
                  <th className="px-6 py-4 text-indigo-400">Outstanding Balance</th>
                  <th className="px-6 py-4">Loan Duration</th>
                  <th className="px-6 py-4">Next Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-[13px]" style={{ color: 'var(--text-primary)' }}>
                {reportsData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-500">No outstanding loans match your filters.</td>
                  </tr>
                ) : (
                  reportsData.map((row: any) => (
                    <tr key={row.id} className="hover:bg-slate-800/20 transition cursor-pointer" onClick={() => onViewSchedule(row)}>
                      <td className="px-6 py-4 font-bold text-slate-400">{row.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-[var(--text-primary)]">{row.applicantName}</div>
                        <div className="text-[11px] text-slate-500">{row.applicantEmail}</div>
                      </td>
                      <td className="px-6 py-4 font-semibold">{formatCurrency(row.amount)}</td>
                      <td className="px-6 py-4 text-slate-400">{formatCurrency(row.totalRepaid)}</td>
                      <td className="px-6 py-4 font-black text-indigo-400">{formatCurrency(row.outstanding)}</td>
                      <td className="px-6 py-4">{row.durationMonths} Months</td>
                      <td className="px-6 py-4 text-[12px]">{formatDate(row.nextPaymentDate)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* B. Payments Report Table */}
          {activeReport === 'report_payments' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-[11.5px] uppercase font-bold tracking-wider" style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}>
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">Repayment Description</th>
                  <th className="px-6 py-4 text-emerald-400">Amount Paid</th>
                  <th className="px-6 py-4">Payment Date</th>
                  <th className="px-6 py-4">Log Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-[13px]" style={{ color: 'var(--text-primary)' }}>
                {reportsData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-500">No repayment logs match your filters.</td>
                  </tr>
                ) : (
                  reportsData.map((row: any) => (
                    <tr key={row.id} className="hover:bg-slate-800/10 transition">
                      <td className="px-6 py-4 font-mono font-bold text-slate-400 text-xs">{row.id}</td>
                      <td className="px-6 py-4 font-bold text-[var(--text-primary)]">{row.title}</td>
                      <td className="px-6 py-4 font-black text-emerald-400">{formatCurrency(Math.abs(row.amount))}</td>
                      <td className="px-6 py-4">{formatDate(row.date)}</td>
                      <td className="px-6 py-4 text-[11.5px] text-slate-500 font-semibold uppercase">{row.type}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* C. Loan Late Report Table */}
          {activeReport === 'report_late' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-[11.5px] uppercase font-bold tracking-wider" style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}>
                  <th className="px-6 py-4">Loan ID</th>
                  <th className="px-6 py-4">Borrower Name</th>
                  <th className="px-6 py-4 text-center">Unpaid Installments</th>
                  <th className="px-6 py-4 text-center">Overdue Duration</th>
                  <th className="px-6 py-4">Accrued Penalty</th>
                  <th className="px-6 py-4">Interest Rate</th>
                  <th className="px-6 py-4">Next Payment Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-[13px]" style={{ color: 'var(--text-primary)' }}>
                {reportsData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-500">No overdue accounts match your filters.</td>
                  </tr>
                ) : (
                  reportsData.map((row: any) => (
                    <tr key={row.id} className="hover:bg-slate-800/20 transition cursor-pointer" onClick={() => onViewSchedule(row)}>
                      <td className="px-6 py-4 font-bold text-slate-400">{row.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-[var(--text-primary)]">{row.applicantName}</div>
                        <div className="text-[11px] text-slate-500">{row.applicantEmail}</div>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-red-400">{row.overdueCount || 1}</td>
                      <td className="px-6 py-4 text-center text-amber-400 font-semibold">{row.overdueDays} Days Late</td>
                      <td className="px-6 py-4 font-bold text-amber-500">{row.penalty.toLocaleString()} KHR</td>
                      <td className="px-6 py-4 font-medium">1.5% Monthly</td>
                      <td className="px-6 py-4 font-semibold text-[12px]">{formatDate(row.nextPaymentDate)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* D. Paid Off Report Table */}
          {activeReport === 'report_paid_off' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-[11.5px] uppercase font-bold tracking-wider" style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}>
                  <th className="px-6 py-4">Loan ID</th>
                  <th className="px-6 py-4">Borrower</th>
                  <th className="px-6 py-4">Original Loan Amount</th>
                  <th className="px-6 py-4">Total Repayments Collected</th>
                  <th className="px-6 py-4 text-purple-400">Total Interest Earned</th>
                  <th className="px-6 py-4">Loan Duration</th>
                  <th className="px-6 py-4">Settled Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-[13px]" style={{ color: 'var(--text-primary)' }}>
                {reportsData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-500">No settled/paid-off loans match your filters.</td>
                  </tr>
                ) : (
                  reportsData.map((row: any) => (
                    <tr key={row.id} className="hover:bg-slate-800/20 transition cursor-pointer" onClick={() => onViewSchedule(row)}>
                      <td className="px-6 py-4 font-bold text-slate-400">{row.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-[var(--text-primary)]">{row.applicantName}</div>
                        <div className="text-[11px] text-slate-500">{row.applicantEmail}</div>
                      </td>
                      <td className="px-6 py-4 font-semibold">{formatCurrency(row.amount)}</td>
                      <td className="px-6 py-4">{formatCurrency(row.amount * 1.18)}</td>
                      <td className="px-6 py-4 font-black text-purple-400">{formatCurrency(row.amount * 0.18)}</td>
                      <td className="px-6 py-4">{row.durationMonths} Months</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                          Fully Paid Off
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

        </div>
      </div>
      
    </div>
  );
}
