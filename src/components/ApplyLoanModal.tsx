import React, { useState } from 'react';
import { X, Sparkles, Files, Briefcase, DollarSign, CheckCircle2 } from 'lucide-react';
import { LoanApplication } from '../types';

interface ApplyLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (app: Partial<LoanApplication>) => void;
}

export default function ApplyLoanModal({ isOpen, onClose, onSubmit }: ApplyLoanModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    amount: '',
    type: 'SME Loan' as LoanApplication['type'],
    purpose: '',
    monthlyIncome: '',
    durationMonths: '24',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Full Name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email address';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors: Record<string, string> = {};
    const amt = parseFloat(formData.amount);
    if (!formData.amount) {
      errors.amount = 'Loan amount is required';
    } else if (isNaN(amt) || amt <= 0) {
      errors.amount = 'Amount must be a positive number';
    }
    if (!formData.purpose.trim()) errors.purpose = 'Purpose of loan is required';
    const inc = parseFloat(formData.monthlyIncome);
    if (!formData.monthlyIncome) {
      errors.monthlyIncome = 'Monthly income is required';
    } else if (isNaN(inc) || inc <= 0) {
      errors.monthlyIncome = 'Income must be a positive number';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) setStep(2);
    }
  };

  const handlePrev = () => {
    setStep(1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setIsSubmitting(true);

    // Simulate backend underwriting score determination
    setTimeout(() => {
      setIsSubmitting(false);
      const generatedId = '#LL' + Math.floor(10000 + Math.random() * 90000);
      const initials = formData.name.split(' ').map(token => token[0]).join('').toUpperCase().slice(0, 2) || 'PP';
      const score = Math.floor(620 + Math.random() * 180); // Generated mock credit score between 620-800

      onSubmit({
        id: generatedId,
        applicantName: formData.name,
        applicantEmail: formData.email,
        initials,
        amount: parseFloat(formData.amount),
        type: formData.type,
        status: 'New',
        urgency: parseFloat(formData.amount) > 100000 ? 'Urgent' : 'Normal',
        assignedToMe: true,
        date: new Date().toISOString().split('T')[0],
        purpose: formData.purpose,
        creditScore: score,
        monthlyIncome: parseFloat(formData.monthlyIncome),
        durationMonths: parseInt(formData.durationMonths, 10),
      });

      setShowSuccess(true);
    }, 1200);
  };

  const handleReset = () => {
    setStep(1);
    setShowSuccess(false);
    setFormData({
      name: '',
      email: '',
      amount: '',
      type: 'SME Loan',
      purpose: '',
      monthlyIncome: '',
      durationMonths: '24',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#0F171C]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-[#c4c7ca] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-[#44474a] hover:bg-[#f1f4f6]"
        >
          <X className="w-5 h-5" />
        </button>

        {showSuccess ? (
          /* SUCCESS PAGE */
          <div className="p-8 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 text-emerald-600 animate-bounce">
              <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
            </div>
            <h3 className="text-[24px] font-sans font-bold text-[#0F171C] mb-2">Application Submitted!</h3>
            <p className="text-[14px] text-[#44474a] max-w-md mx-auto mb-8 leading-relaxed">
              Your application for a <span className="font-bold text-[#0F171C]">{formData.amount} USD</span> loan has been filed. Underwriters will perform verification shortly. Your temporary reference details have been registered.
            </p>
            <button
              onClick={handleReset}
              className="px-8 py-3 bg-[#0F171C] text-white font-bold text-[14px] rounded-lg hover:bg-slate-800 transition"
            >
              Back to Portal
            </button>
          </div>
        ) : (
          /* MULTISTEP FORM */
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="text-[#006b59] w-5 h-5 fill-[#5CF2D0]" />
              <h3 className="text-[20px] font-sans font-bold text-[#0F171C]">Apply for Loan</h3>
            </div>

            {/* Stepper HUD */}
            <div className="flex items-center gap-3 mb-8">
              <div className={`flex-1 h-2 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-[#5CF2D0]' : 'bg-gray-200'}`}></div>
              <div className={`flex-1 h-2 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-[#5CF2D0]' : 'bg-gray-200'}`}></div>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5">
              {step === 1 ? (
                /* STEP 1: PERSONAL INFORMATION */
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="text-[13px] uppercase font-bold text-[#0F171C] tracking-wide mb-2 flex items-center gap-1.5 border-b pb-1">
                    <Files className="w-4 h-4" /> Personal Contacts
                  </div>

                  <div>
                    <label className="block text-[13px] font-bold text-[#0F171C] mb-1.5">Applicant Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. John Doe"
                      className={`w-full bg-white border rounded-lg p-3 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#0F171C] ${
                        formErrors.name ? 'border-red-500' : 'border-[#c4c7ca]'
                      }`}
                    />
                    {formErrors.name && <p className="text-red-500 text-[11px] mt-1 font-semibold">{formErrors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-[13px] font-bold text-[#0F171C] mb-1.5">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g. name@domain.com"
                      className={`w-full bg-white border rounded-lg p-3 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#0F171C] ${
                        formErrors.email ? 'border-red-500' : 'border-[#c4c7ca]'
                      }`}
                    />
                    {formErrors.email && <p className="text-red-500 text-[11px] mt-1 font-semibold">{formErrors.email}</p>}
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-6 py-2.5 bg-[#0F171C] text-white text-[14px] font-bold rounded-lg hover:bg-slate-800 transition cursor-pointer"
                    >
                      Next Step
                    </button>
                  </div>
                </div>
              ) : (
                /* STEP 2: LOAN CONTEXTS */
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="text-[13px] uppercase font-bold text-[#0F171C] tracking-wide mb-2 flex items-center gap-1.5 border-b pb-1">
                    <Briefcase className="w-4 h-4" /> Financial Proposal
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-bold text-[#0F171C] mb-1.5">Amount (USD)</label>
                      <div className="relative">
                        <DollarSign className="w-4 h-4 text-[#44474a] absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="number"
                          name="amount"
                          value={formData.amount}
                          onChange={handleInputChange}
                          placeholder="e.g. 15000"
                          className={`w-full bg-white border rounded-lg pl-8 pr-3 p-2.5 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#0F171C] ${
                            formErrors.amount ? 'border-red-500' : 'border-[#c4c7ca]'
                          }`}
                        />
                      </div>
                      {formErrors.amount && <p className="text-red-500 text-[11px] mt-1 font-semibold">{formErrors.amount}</p>}
                    </div>

                    <div>
                      <label className="block text-[13px] font-bold text-[#0F171C] mb-1.5">Monthly Income (USD)</label>
                      <div className="relative">
                        <DollarSign className="w-4 h-4 text-[#44474a] absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="number"
                          name="monthlyIncome"
                          value={formData.monthlyIncome}
                          onChange={handleInputChange}
                          placeholder="e.g. 5000"
                          className={`w-full bg-white border rounded-lg pl-8 pr-3 p-2.5 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#0F171C] ${
                            formErrors.monthlyIncome ? 'border-red-500' : 'border-[#c4c7ca]'
                          }`}
                        />
                      </div>
                      {formErrors.monthlyIncome && <p className="text-red-500 text-[11px] mt-1 font-semibold">{formErrors.monthlyIncome}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-bold text-[#0F171C] mb-1.5">Loan Category</label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-[#c4c7ca] rounded-lg p-2.5 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#0F171C]"
                      >
                        <option value="SME Loan">SME Loan</option>
                        <option value="Housing">Housing</option>
                        <option value="Personal">Personal</option>
                        <option value="Auto">Auto</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[13px] font-bold text-[#0F171C] mb-1.5">Duration (Months)</label>
                      <select
                        name="durationMonths"
                        value={formData.durationMonths}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-[#c4c7ca] rounded-lg p-2.5 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#0F171C]"
                      >
                        <option value="12">12 Months (1 yr)</option>
                        <option value="24">24 Months (2 yrs)</option>
                        <option value="36">36 Months (3 yrs)</option>
                        <option value="60">60 Months (5 yrs)</option>
                        <option value="180">180 Months (15 yrs)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] font-bold text-[#0F171C] mb-1.5">Intended Loan Purpose</label>
                    <textarea
                      name="purpose"
                      rows={3}
                      value={formData.purpose}
                      onChange={handleInputChange}
                      placeholder="e.g., procurement of new coffee roasting machinery and rental deposit."
                      className={`w-full bg-white border rounded-lg p-3 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#0F171C] ${
                        formErrors.purpose ? 'border-red-500' : 'border-[#c4c7ca]'
                      }`}
                    />
                    {formErrors.purpose && <p className="text-red-500 text-[11px] mt-1 font-semibold">{formErrors.purpose}</p>}
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="px-6 py-2.5 border border-[#c4c7ca] text-[#0F171C] text-[14px] font-bold rounded-lg hover:bg-[#f1f4f6]"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 bg-[#0F171C] text-white text-[14px] font-bold rounded-lg hover:bg-slate-800 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing Underwriting...
                        </>
                      ) : (
                        'Submit Verification'
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
