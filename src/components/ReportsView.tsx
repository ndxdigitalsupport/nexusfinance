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
  const { formatCurrency, t, isKhmer } = useCurrency();

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

  // Excel (.xls) Export helper
  const exportToExcel = () => {
    let headers: string[] = [];
    let rows: string[][] = [];

    const getStatusText = (status: string) => {
      if (!status) return 'N/A';
      if (!isKhmer) return status;
      const lower = status.toLowerCase();
      if (lower === 'paid' || lower === 'paid off' || lower === 'paidoff') return 'បានសងរួច';
      if (lower === 'unpaid') return 'មិនទាន់សង';
      if (lower === 'overdue') return 'ហួសកំណត់';
      if (lower === 'on time' || lower === 'ontime') return 'ទាន់ពេល';
      return status;
    };

    if (activeReport === 'report_outstanding') {
      headers = isKhmer 
        ? ["លេខកូដឥណទាន", "ឈ្មោះអ្នកខ្ចី", "អ៊ីមែល", "ទឹកប្រាក់ដើមសរុប", "ប្រាក់សងសរុប", "សមតុល្យជំពាក់", "រយៈពេលឥណទាន", "ស្ថានភាព"]
        : ["Loan ID", "Borrower Name", "Email", "Original Amount", "Total Repaid", "Outstanding Balance", "Term", "Status"];
      rows = reportsData.map((row: any) => [
        row.id,
        row.applicantName,
        row.applicantEmail,
        formatCurrency(row.amount),
        formatCurrency(row.totalRepaid),
        formatCurrency(row.outstanding),
        `${row.durationMonths} ${isKhmer ? 'ខែ' : 'Months'}`,
        getStatusText(row.repaymentStatus || 'N/A')
      ]);
    } else if (activeReport === 'report_payments') {
      headers = isKhmer
        ? ["លេខកូដប្រតិបត្តិការ", "ការពិពណ៌នា", "ចំនួនទឹកប្រាក់", "កាលបរិច្ឆេទ", "ប្រភេទ"]
        : ["Transaction ID", "Description", "Amount", "Date", "Type"];
      rows = reportsData.map((row: any) => [
        row.id,
        row.title,
        formatCurrency(Math.abs(row.amount)),
        formatDate(row.date),
        row.type
      ]);
    } else if (activeReport === 'report_late') {
      headers = isKhmer
        ? ["លេខកូដឥណទាន", "ឈ្មោះអ្នកខ្ចី", "ការបង់រំលោះយឺតយ៉ាវ", "ចំនួនថ្ងៃហួសកំណត់ប្រហាក់ប្រហែល", "អត្រាការប្រាក់", "កាលបរិច្ឆេទបង់ប្រាក់បន្ទាប់", "ប្រាក់ពិន័យ"]
        : ["Loan ID", "Borrower Name", "Overdue Installments", "Estimated Overdue Days", "Interest Rate", "Next Payment Date", "Penalty"];
      rows = reportsData.map((row: any) => [
        row.id,
        row.applicantName,
        (row.overdueCount || 1).toString(),
        `${row.overdueDays} ${isKhmer ? 'ថ្ងៃ' : 'Days'}`,
        "1.5%",
        formatDate(row.nextPaymentDate),
        formatCurrency(row.penalty)
      ]);
    } else if (activeReport === 'report_paid_off') {
      headers = isKhmer
        ? ["លេខកូដឥណទាន", "ឈ្មោះអ្នកខ្ចី", "អ៊ីមែល", "ទឹកប្រាក់បើកផ្តល់", "រយៈពេល (ខែ)", "ស្ថានភាពចុងក្រោយ"]
        : ["Loan ID", "Borrower Name", "Email", "Disbursement Amount", "Duration Months", "Term End Status"];
      rows = reportsData.map((row: any) => [
        row.id,
        row.applicantName,
        row.applicantEmail,
        formatCurrency(row.amount),
        `${row.durationMonths} ${isKhmer ? 'ខែ' : 'Months'}`,
        isKhmer ? "បានសងដាច់" : "Paid Off"
      ]);
    }

    const excelHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <style>
          table { border-collapse: collapse; }
          th { background-color: #0d9488; color: white; font-weight: bold; border: 1px solid #ddd; padding: 8px; font-family: sans-serif; font-size: 13px; }
          td { border: 1px solid #ddd; padding: 8px; font-family: sans-serif; font-size: 12px; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              ${headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map(row => `
              <tr>
                ${row.map(val => `<td>${val}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([excelHtml], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `NexusFinance_${activeReport}_${new Date().toISOString().slice(0, 10)}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF Print Trigger
  const triggerPrint = () => {
    window.print();
  };

  // Titles mapping with dynamic localized values
  const reportTitles: { [key: string]: { title: string; subtitle: string; color: string; icon: any } } = {
    report_outstanding: {
      title: t('report_outstanding'),
      subtitle: t('report_outstanding_desc'),
      color: 'from-blue-500 to-indigo-600',
      icon: TrendingUp
    },
    report_payments: {
      title: t('report_payments'),
      subtitle: t('report_payments_desc'),
      color: 'from-emerald-500 to-teal-600',
      icon: Receipt
    },
    report_late: {
      title: t('report_late'),
      subtitle: t('report_late_desc'),
      color: 'from-amber-500 to-orange-600',
      icon: AlertTriangle
    },
    report_paid_off: {
      title: t('report_paid_off'),
      subtitle: t('report_paid_off_desc'),
      color: 'from-purple-500 to-pink-600',
      icon: CheckCircle
    }
  };

  const reportInfo = reportTitles[activeReport] || {
    title: t('reports_menu'),
    subtitle: t('reports_desc') || 'Manage and audit platform data.',
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
            onClick={exportToExcel}
            className="px-4 py-2.5 bg-[var(--surface-secondary)] hover:brightness-110 text-[var(--text-primary)] border rounded-xl text-[12.5px] font-bold transition flex items-center gap-1.5 cursor-pointer"
            style={{ borderColor: 'var(--border-primary)' }}
          >
            <Download className="w-4 h-4" />
            <span>{t('excel_export')}</span>
          </button>
          <button
            onClick={triggerPrint}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-105 text-white rounded-xl text-[12.5px] font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{t('print_report')}</span>
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
            placeholder={t('search_placeholder')}
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
                  <th className="px-6 py-4">{t('loan_id')}</th>
                  <th className="px-6 py-4">{t('borrower')}</th>
                  <th className="px-6 py-4">{t('original_amount')}</th>
                  <th className="px-6 py-4">{t('total_repaid')}</th>
                  <th className="px-6 py-4 text-indigo-400">{t('outstanding_balance')}</th>
                  <th className="px-6 py-4">{t('loan_duration')}</th>
                  <th className="px-6 py-4">{t('next_due_date')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-[13px]" style={{ color: 'var(--text-primary)' }}>
                {reportsData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-500">{t('no_outstanding_loans')}</td>
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
                      <td className="px-6 py-4">{row.durationMonths} {t('months')}</td>
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
                  <th className="px-6 py-4">{t('transaction_id')}</th>
                  <th className="px-6 py-4">{t('repayment_description')}</th>
                  <th className="px-6 py-4 text-emerald-400">{t('amount_paid')}</th>
                  <th className="px-6 py-4">{t('payment_date')}</th>
                  <th className="px-6 py-4">{t('log_type')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-[13px]" style={{ color: 'var(--text-primary)' }}>
                {reportsData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-500">{t('no_repayment_logs')}</td>
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
                  <th className="px-6 py-4">{t('loan_id')}</th>
                  <th className="px-6 py-4">{t('borrower_name_label')}</th>
                  <th className="px-6 py-4 text-center">{t('unpaid_installments')}</th>
                  <th className="px-6 py-4 text-center">{t('overdue_duration')}</th>
                  <th className="px-6 py-4">{t('accrued_penalty')}</th>
                  <th className="px-6 py-4">{t('interest_rate')}</th>
                  <th className="px-6 py-4">{t('next_due_date')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-[13px]" style={{ color: 'var(--text-primary)' }}>
                {reportsData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-500">{t('no_overdue_accounts')}</td>
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
                  <th className="px-6 py-4">{t('loan_id')}</th>
                  <th className="px-6 py-4">{t('borrower')}</th>
                  <th className="px-6 py-4">{t('original_loan_amount')}</th>
                  <th className="px-6 py-4">{t('total_repayments_collected')}</th>
                  <th className="px-6 py-4 text-purple-400">{t('total_interest_earned')}</th>
                  <th className="px-6 py-4">{t('loan_duration')}</th>
                  <th className="px-6 py-4">{t('settled_status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-[13px]" style={{ color: 'var(--text-primary)' }}>
                {reportsData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-500">{t('no_settled_loans')}</td>
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
                      <td className="px-6 py-4">{row.durationMonths} {t('months')}</td>
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
