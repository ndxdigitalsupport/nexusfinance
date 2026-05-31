import React, { useState, useMemo } from 'react';
import { X, Sparkles, User, Mail, DollarSign, Briefcase, Calendar, FileText, CheckCircle2, ArrowRight, ArrowLeft, Clock } from 'lucide-react';
import { LoanApplication } from '../types';

interface ApplyLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (app: Partial<LoanApplication>) => void;
  userName?: string;
  userEmail?: string;
}

const LOAN_TYPES = ['SME Loan', 'Housing', 'Personal', 'Auto'] as const;
const DURATIONS = [
  { value: '12', label: '12 Months', sub: '1 year' },
  { value: '24', label: '24 Months', sub: '2 years' },
  { value: '36', label: '36 Months', sub: '3 years' },
  { value: '60', label: '60 Months', sub: '5 years' },
  { value: '180', label: '180 Months', sub: '15 years' },
];

export default function ApplyLoanModal({ isOpen, onClose, onSubmit, userName, userEmail }: ApplyLoanModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', email: '', amount: '', type: 'SME Loan', purpose: '', monthlyIncome: '', durationMonths: '24',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  React.useEffect(() => {
    if (isOpen && (userName || userEmail)) {
      setFormData(prev => ({ ...prev, name: userName || prev.name, email: userEmail || prev.email }));
    }
  }, [isOpen, userName, userEmail]);

  const estimatedPayment = useMemo(() => {
    const amt = parseFloat(formData.amount);
    const months = parseInt(formData.durationMonths) || 1;
    if (!amt || amt <= 0) return null;
    const rate = 0.054 / 12;
    const payment = (amt * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
    return { monthly: payment, total: payment * months };
  }, [formData.amount, formData.durationMonths]);

  if (!isOpen) return null;

  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email address';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors: Record<string, string> = {};
    const amt = parseFloat(formData.amount);
    if (!formData.amount) errors.amount = 'Loan amount is required';
    else if (isNaN(amt) || amt <= 0) errors.amount = 'Must be a positive number';
    if (!formData.purpose.trim()) errors.purpose = 'Loan purpose is required';
    const inc = parseFloat(formData.monthlyIncome);
    if (!formData.monthlyIncome) errors.monthlyIncome = 'Monthly income is required';
    else if (isNaN(inc) || inc <= 0) errors.monthlyIncome = 'Must be a positive number';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => { if (validateStep1()) setStep(2); };
  const handlePrev = () => setStep(1);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        applicantName: formData.name, applicantEmail: formData.email,
        amount: parseFloat(formData.amount), type: formData.type as LoanApplication['type'],
        purpose: formData.purpose, monthlyIncome: parseFloat(formData.monthlyIncome),
        durationMonths: parseInt(formData.durationMonths, 10),
      });
      setShowSuccess(true);
    } catch { setIsSubmitting(false); }
  };

  const handleReset = () => {
    setStep(1); setShowSuccess(false);
    setFormData({ name: userName || '', email: userEmail || '', amount: '', type: 'SME Loan', purpose: '', monthlyIncome: '', durationMonths: '24' });
    onClose();
  };

  const inputClass = (field: string) =>
    `w-full bg-[#f8fafc] border rounded-xl px-4 py-3 text-[14px] text-[#0F171C] placeholder:text-[#94a3b8] transition-all duration-200 focus:bg-white focus:border-[#5CF2D0] focus:ring-2 focus:ring-[#5CF2D0]/20 ${formErrors[field] ? 'border-red-400 bg-red-50' : 'border-[#e2e8f0] hover:border-[#94a3b8]'}`;

  const steps = [
    { num: 1, label: 'Personal Info', icon: User },
    { num: 2, label: 'Loan Details', icon: Briefcase },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-white/20 relative overflow-hidden">
        <button onClick={onClose} className="absolute top-5 right-5 z-10 p-2 rounded-full bg-[#f1f4f6] hover:bg-[#e2e8f0] text-[#44474a] hover:text-[#0F171C] transition-all cursor-pointer">
          <X className="w-4 h-4" />
        </button>

        {showSuccess ? (
          <div className="p-10 text-center flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center mb-6 shadow-inner">
              <CheckCircle2 className="w-14 h-14 text-emerald-500" />
            </div>
            <h3 className="text-[26px] font-extrabold text-[#0F171C] mb-2">Application Submitted!</h3>
            <p className="text-[15px] text-[#64748b] max-w-sm mx-auto mb-2 leading-relaxed">
              Your <span className="font-bold text-[#0F171C]">${parseFloat(formData.amount).toLocaleString()} {formData.type}</span> application has been filed.
            </p>
            <p className="text-[13px] text-[#94a3b8] mb-8">Underwriters will perform verification shortly.</p>
            <button onClick={handleReset} className="px-10 py-3 bg-gradient-to-r from-[#0F171C] to-slate-800 text-white font-bold text-[14px] rounded-xl hover:brightness-110 transition-all shadow-lg shadow-black/10 cursor-pointer">
              Back to Portal
            </button>
          </div>
        ) : (
          <div>
            <div className="bg-gradient-to-br from-[#0F171C] to-slate-800 px-8 pt-8 pb-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#5CF2D0]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#5CF2D0]/5 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="flex items-center gap-2.5 mb-1 relative z-10">
                <div className="p-2 bg-[#5CF2D0]/10 rounded-lg">
                  <Sparkles className="w-5 h-5 text-[#5CF2D0]" />
                </div>
                <div>
                  <h3 className="text-[20px] font-extrabold text-white">Apply for Loan</h3>
                  <p className="text-[13px] text-white/60">Complete the application in two steps</p>
                </div>
              </div>
            </div>

            <div className="px-8 -mt-5 relative z-10">
              <div className="bg-white rounded-xl shadow-lg border border-[#e2e8f0] p-1.5 flex">
                {steps.map(s => {
                  const Icon = s.icon;
                  const active = step === s.num;
                  const done = step > s.num;
                  return (
                    <div key={s.num} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-bold transition-all duration-300 ${active ? 'bg-[#0F171C] text-white shadow-md' : done ? 'bg-emerald-50 text-emerald-600' : 'text-[#94a3b8]'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold ${active ? 'bg-white/20 text-white' : done ? 'bg-emerald-200 text-emerald-700' : 'bg-[#e2e8f0] text-[#94a3b8]'}`}>
                        {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.num}
                      </div>
                      <span className="hidden sm:inline">{s.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="px-8 pb-8 pt-6 space-y-5">
              {step === 1 ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
                  <div>
                    <label className="block text-[12px] font-bold text-[#64748b] uppercase tracking-wider mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#94a3b8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="John Doe" className={`${inputClass('name')} pl-10`} />
                    </div>
                    {formErrors.name && <p className="text-red-500 text-[12px] mt-1 font-semibold flex items-center gap-1"><span className="w-1 h-1 bg-red-500 rounded-full" />{formErrors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#64748b] uppercase tracking-wider mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#94a3b8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="name@domain.com" className={`${inputClass('email')} pl-10`} />
                    </div>
                    {formErrors.email && <p className="text-red-500 text-[12px] mt-1 font-semibold flex items-center gap-1"><span className="w-1 h-1 bg-red-500 rounded-full" />{formErrors.email}</p>}
                  </div>
                  <div className="pt-2 flex justify-end">
                    <button type="button" onClick={handleNext} className="px-7 py-3 bg-gradient-to-r from-[#0F171C] to-slate-800 text-white text-[14px] font-bold rounded-xl hover:brightness-110 transition-all shadow-lg shadow-black/10 flex items-center gap-2 cursor-pointer">
                      Next Step <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-bold text-[#64748b] uppercase tracking-wider mb-1.5">Loan Amount</label>
                      <div className="relative">
                        <DollarSign className="w-4 h-4 text-[#94a3b8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} placeholder="15000" className={`${inputClass('amount')} pl-10`} />
                      </div>
                      {formErrors.amount && <p className="text-red-500 text-[12px] mt-1 font-semibold flex items-center gap-1"><span className="w-1 h-1 bg-red-500 rounded-full" />{formErrors.amount}</p>}
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-[#64748b] uppercase tracking-wider mb-1.5">Monthly Income</label>
                      <div className="relative">
                        <DollarSign className="w-4 h-4 text-[#94a3b8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input type="number" name="monthlyIncome" value={formData.monthlyIncome} onChange={handleInputChange} placeholder="5000" className={`${inputClass('monthlyIncome')} pl-10`} />
                      </div>
                      {formErrors.monthlyIncome && <p className="text-red-500 text-[12px] mt-1 font-semibold flex items-center gap-1"><span className="w-1 h-1 bg-red-500 rounded-full" />{formErrors.monthlyIncome}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-bold text-[#64748b] uppercase tracking-wider mb-1.5">Loan Category</label>
                      <div className="relative">
                        <Briefcase className="w-4 h-4 text-[#94a3b8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <select name="type" value={formData.type} onChange={handleInputChange} className={`${inputClass('type')} pl-10 appearance-none bg-no-repeat`} style={{ backgroundPosition: 'right 12px center', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")` }}>
                          {LOAN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-[#64748b] uppercase tracking-wider mb-1.5">Duration</label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-[#94a3b8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <select name="durationMonths" value={formData.durationMonths} onChange={handleInputChange} className={`${inputClass('durationMonths')} pl-10 appearance-none bg-no-repeat`} style={{ backgroundPosition: 'right 12px center', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")` }}>
                          {DURATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-[#64748b] uppercase tracking-wider mb-1.5">Loan Purpose</label>
                    <div className="relative">
                      <FileText className="w-4 h-4 text-[#94a3b8] absolute left-3.5 top-3.5" />
                      <textarea name="purpose" rows={3} value={formData.purpose} onChange={handleInputChange} placeholder="Describe the purpose of this loan..." className={`${inputClass('purpose')} pl-10 resize-none`} />
                    </div>
                    {formErrors.purpose && <p className="text-red-500 text-[12px] mt-1 font-semibold flex items-center gap-1"><span className="w-1 h-1 bg-red-500 rounded-full" />{formErrors.purpose}</p>}
                  </div>

                  {estimatedPayment && (
                    <div className="bg-gradient-to-r from-[#f0fdfa] to-white border border-[#5CF2D0]/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-[#0d9488]" />
                        <p className="text-[12px] font-bold text-[#64748b] uppercase tracking-wider">Estimated Payment</p>
                      </div>
                      <div className="flex items-baseline gap-3">
                        <span className="text-[24px] font-extrabold text-[#0F171C]">${Math.round(estimatedPayment.monthly).toLocaleString()}</span>
                        <span className="text-[13px] text-[#64748b]">/month for {formData.durationMonths} months</span>
                      </div>
                      <p className="text-[12px] text-[#94a3b8] mt-0.5">Total repayment: ${Math.round(estimatedPayment.total).toLocaleString()} · APR 5.4%</p>
                    </div>
                  )}

                  <div className="pt-2 flex justify-between">
                    <button type="button" onClick={handlePrev} className="px-6 py-3 border border-[#e2e8f0] text-[#64748b] text-[14px] font-bold rounded-xl hover:bg-[#f8fafc] hover:border-[#94a3b8] transition-all flex items-center gap-2 cursor-pointer">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button type="submit" disabled={isSubmitting} className="px-7 py-3 bg-gradient-to-r from-[#0F171C] to-slate-800 text-white text-[14px] font-bold rounded-xl hover:brightness-110 transition-all shadow-lg shadow-black/10 disabled:opacity-50 flex items-center gap-2 cursor-pointer">
                      {isSubmitting ? (
                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
                      ) : (
                        'Submit Application'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
