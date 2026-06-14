import React, { useState } from 'react';
import { X, Check, ShieldAlert, Building, Contact2 } from 'lucide-react';
import { LoanApplication } from '../types';

interface ApplicationDetailsModalProps {
  application: LoanApplication | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onHold: (id: string) => void;
}

export default function ApplicationDetailsModal({
  application,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onHold
}: ApplicationDetailsModalProps) {
  const [submittingAction, setSubmittingAction] = useState<'approve' | 'reject' | 'hold' | null>(null);

  if (!isOpen || !application) return null;

  // Credit rating score badge style solver
  const getCreditScoreStyling = (score: number) => {
    if (score >= 720) return { text: 'Excellent', color: 'var(--success-text)', bg: 'var(--success-bg)', scoreBg: 'var(--success-text)' };
    if (score >= 680) return { text: 'Good', color: 'var(--accent)', bg: 'var(--accent-muted)', scoreBg: 'var(--accent)' };
    if (score >= 620) return { text: 'Fair', color: 'var(--warning-text)', bg: 'var(--warning-bg)', scoreBg: 'var(--warning-text)' };
    return { text: 'Substandard', color: 'var(--error-text)', bg: 'var(--error-bg)', scoreBg: 'var(--error-text)' };
  };

  const scoreInfo = getCreditScoreStyling(application.creditScore);

  // Compute Debt-To-Income (DTI) ratio
  // Monthly payment estimation: roughly amount / duration
  const monthlyPaymentEst = application.amount / application.durationMonths;
  const dtiRatio = ((monthlyPaymentEst / application.monthlyIncome) * 100).toFixed(1);

  const dtiRisk = parseFloat(dtiRatio) > 35 ? 'High Risk' : 'Healthy';

  const handleActionClick = (action: 'approve' | 'reject' | 'hold') => {
    if (action === 'approve') onApprove(application.id);
    if (action === 'reject') onReject(application.id);
    if (action === 'hold') onHold(application.id);
    onClose();
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Application details" className="fixed inset-0 bg-[var(--modal-overlay)] backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto font-sans animate-in fade-in duration-150">
      <div className="bg-[var(--surface-card)] w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden border border-[var(--border-primary)] my-8 relative animate-modal-enter">
        
        {/* Header toolbar */}
        <div className="bg-[var(--sidebar-bg)] text-white px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="premium-badge text-[12px] font-sans font-bold px-3 py-1 uppercase tracking-wider rounded-md border"
              style={{
                backgroundColor: application.urgency === 'Urgent' ? 'var(--error-bg)' : 'var(--info-bg)',
                color: application.urgency === 'Urgent' ? 'var(--error-text)' : 'var(--info-text)',
                borderColor: application.urgency === 'Urgent' ? 'var(--error-bg)' : 'var(--info-bg)',
              }}
            >
              {application.urgency}
            </div>
            <h3 className="text-[18px] font-sans font-bold leading-tight">Details for {application.id}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal body */}
        <div className="p-6 space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Requested amount', value: `$${application.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: '$' },
              { label: 'Duration term', value: `${application.durationMonths} Months`, icon: '⏱' },
              { label: 'Category', value: application.type, icon: '📋' },
              { label: 'Current status', value: application.status, icon: '●', color: 'var(--warning-text)' },
            ].map((s, i) => (
              <div key={s.label} className={`stagger-${i + 1} premium-card-dark rounded-xl p-3`}>
                <span className="text-[11px] font-bold uppercase tracking-wider block"
                  style={{ color: 'var(--card-dark-text)' }}
                >{s.label}</span>
                <span className="text-[18px] font-sans font-bold block"
                  style={{ color: s.color ? s.color : 'var(--card-dark-text-bright)' }}
                >
                  {s.value}
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Applicant Contacts */}
            <div className="space-y-4">
              <h4 className="text-[14px] font-bold text-[var(--text-primary)] border-b pb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
                <Contact2 className="w-4 h-4 text-[var(--text-secondary)]" /> Applicant Demographics
              </h4>
              <div className="space-y-3 text-[13.5px]">
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)] font-medium">Full Name:</span>
                  <span className="font-bold text-[var(--text-primary)]">{application.applicantName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)] font-medium">Email Address:</span>
                  <span className="font-bold text-[var(--text-primary)]">{application.applicantEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)] font-medium">Date Applied:</span>
                  <span className="font-bold text-[var(--text-primary)]">{application.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)] font-medium">Monthly Income:</span>
                  <span className="font-bold font-mono" style={{ color: 'var(--accent)' }}>${application.monthlyIncome.toLocaleString()} / mo</span>
                </div>
              </div>
            </div>

            {/* Financial Risk profiling */}
            <div className="space-y-4">
              <h4 className="text-[14px] font-bold text-[var(--text-primary)] border-b pb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
                <ShieldAlert className="w-4 h-4 text-[var(--text-secondary)]" /> Risk Analysis Meter
              </h4>
              <div className="space-y-3 text-[13.5px]">
                {/* Credit Score */}
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-secondary)] font-medium">Credit Score limit:</span>
                  <div className="premium-badge px-2.5 py-0.5 rounded-full text-[11px] font-bold border"
                    style={{ backgroundColor: scoreInfo.bg, color: scoreInfo.color, borderColor: scoreInfo.bg }}
                  >
                    {application.creditScore} - {scoreInfo.text}
                  </div>
                </div>
                
                {/* Visual score range */}
                <div className="w-full h-2.5 bg-[var(--surface-secondary)] rounded-full overflow-hidden relative border border-[var(--border-primary)]">
                  <div 
                    className="h-full transition-all duration-500 rounded-full"
                    style={{ width: `${Math.max(10, Math.min(100, ((application.creditScore - 300) / 550) * 100))}%`, backgroundColor: scoreInfo.scoreBg }}
                  ></div>
                </div>

                {/* DTI */}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[var(--text-secondary)] font-medium">Debt-to-Income (DTI):</span>
                  <span className="font-bold" style={{ color: parseFloat(dtiRatio) > 35 ? 'var(--error-text)' : 'var(--success-text)' }}>
                    {dtiRatio}% ({dtiRisk})
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-tertiary)] leading-tight">
                  Estimation based on calculated monthly payment of ${monthlyPaymentEst.toLocaleString(undefined, { maximumFractionDigits: 0 })} /mo against verifiable incoming income of ${application.monthlyIncome.toLocaleString()} /mo.
                </p>
              </div>
            </div>
          </div>

          {/* Stated Purpose */}
          <div className="space-y-2">
            <h4 className="text-[14px] font-bold text-[var(--text-primary)] flex items-center gap-1.5 uppercase tracking-wide border-b pb-1">
              <Building className="w-4 h-4 text-[var(--text-secondary)]" /> Project/Loan Purpose Statement
            </h4>
            <p className="bg-[var(--surface-secondary)] text-[13.5px] p-4 rounded-xl text-[var(--text-primary)] italic leading-relaxed border border-[var(--border-primary)]">
              "{application.purpose}"
            </p>
          </div>

          {/* Underwriter action choices */}
          <div className="bg-[var(--surface-secondary)] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-[var(--border-primary)]">
            <div>
              <span className="text-[13px] font-bold text-[var(--text-primary)] block">Review Action Panel</span>
              <span className="text-[11px] text-[var(--text-secondary)] block font-medium">Resolving this petition locks current asset statistics.</span>
            </div>
            
            <div className="flex gap-2">
              <button
                disabled={submittingAction !== null}
                onClick={() => handleActionClick('hold')}
                className="px-4 py-2 premium-card border border-[var(--border-primary)] text-[13px] font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)] rounded-lg transition disabled:opacity-50 cursor-pointer"
              >
                {submittingAction === 'hold' ? 'Suspending...' : 'Put on Hold'}
              </button>
              
              <button
                disabled={submittingAction !== null}
                onClick={() => handleActionClick('reject')}
                className="px-4 py-2 text-white text-[13px] font-bold rounded-lg transition disabled:opacity-50 cursor-pointer"
                style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error-text)' }}
              >
                {submittingAction === 'reject' ? 'Denying...' : 'Reject Loan'}
              </button>
              
              <button
                disabled={submittingAction !== null}
                onClick={() => handleActionClick('approve')}
                className="px-5 py-2 premium-btn-primary text-[13px] font-bold rounded-lg transition disabled:opacity-50 flex items-center gap-1 cursor-pointer"
              >
                {submittingAction === 'approve' ? (
                  'Confirming...'
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" /> Approve Account
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
