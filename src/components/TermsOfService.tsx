import React from 'react';
import { FileText, ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[var(--surface-secondary)]">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <a href="/" className="inline-flex items-center gap-2 text-[13px] font-semibold text-[var(--accent)] hover:opacity-80 transition">
            <ArrowLeft className="w-4 h-4" /> Back to NexusFinance
          </a>
        </div>

        <div className="bg-[var(--surface-card)] rounded-3xl border border-[var(--border-primary)] p-8 sm:p-12 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-[var(--accent)]" />
            </div>
            <div>
              <h1 className="text-[28px] font-extrabold text-[var(--text-primary)]">Terms of Service</h1>
              <p className="text-[12px] text-[var(--text-tertiary)] font-medium">Effective Date: August 2026</p>
            </div>
          </div>

          <div className="prose prose-sm max-w-none space-y-8 text-[14px] leading-relaxed text-[var(--text-secondary)]">
            <section>
              <h2 className="text-[18px] font-bold text-[var(--text-primary)] mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using the NexusFinance platform (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[var(--text-primary)] mb-3">2. Description of Service</h2>
              <p>
                NexusFinance is a digital lending platform that facilitates loan applications, processing, and repayment management. The Service connects borrowers with lending officers and administrators for loan underwriting and disbursement.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[var(--text-primary)] mb-3">3. Eligibility</h2>
              <p>To use the Service, you must:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Be at least 18 years of age</li>
                <li>Be a resident of the Kingdom of Cambodia</li>
                <li>Provide accurate and complete registration information</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[var(--text-primary)] mb-3">4. Account Responsibilities</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You must notify us immediately of any unauthorized use of your account</li>
                <li>You may not share your account with others or allow multiple users under one account</li>
                <li>You must provide truthful and accurate information during registration and loan applications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[var(--text-primary)] mb-3">5. Loan Terms</h2>
              <p>
                NexusFinance facilitates loan processing but is not a direct lender. All loan terms, including interest rates, repayment schedules, and fees, are determined by the lending institution and are subject to applicable laws of the Kingdom of Cambodia. Submitting a loan application does not guarantee approval.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[var(--text-primary)] mb-3">6. Payments</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Loan repayments are processed through third-party payment processors (ABA PayWay, Bakong KHQR)</li>
                <li>You are responsible for ensuring sufficient funds for scheduled payments</li>
                <li>Late or missed payments may result in additional fees and impact your credit score</li>
                <li>All payment transactions are subject to the terms and conditions of the respective payment processors</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[var(--text-primary)] mb-3">7. Prohibited Conduct</h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Provide false or misleading information in loan applications</li>
                <li>Use the Service for any unlawful purpose</li>
                <li>Attempt to gain unauthorized access to the Service or other user accounts</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Use automated systems to access the Service without our written permission</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[var(--text-primary)] mb-3">8. Intellectual Property</h2>
              <p>
                All content, trademarks, and intellectual property on the Service are owned by NexusFinance or its licensors. You may not copy, modify, distribute, or reverse-engineer any part of the Service without our prior written consent.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[var(--text-primary)] mb-3">9. Limitation of Liability</h2>
              <p>
                NexusFinance shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service. Our total liability shall not exceed the amount you paid to us in the twelve (12) months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[var(--text-primary)] mb-3">10. Termination</h2>
              <p>
                We may suspend or terminate your access to the Service at any time, with or without cause, and with or without notice. You may also request account deletion through the Profile page or by contacting support.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[var(--text-primary)] mb-3">11. Governing Law</h2>
              <p>
                These Terms are governed by and construed in accordance with the laws of the Kingdom of Cambodia. Any disputes arising under these Terms shall be resolved in the competent courts of Phnom Penh, Cambodia.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[var(--text-primary)] mb-3">12. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. Changes will be effective upon posting. Your continued use of the Service after changes are posted constitutes acceptance of the revised Terms.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[var(--text-primary)] mb-3">13. Contact Us</h2>
              <p>
                For questions about these Terms, please contact us through the Support section of the app or email us at support@nexusfinance.app.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
