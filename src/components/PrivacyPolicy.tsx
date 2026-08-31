import React from 'react';
import { Shield, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
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
              <Shield className="w-6 h-6 text-[var(--accent)]" />
            </div>
            <div>
              <h1 className="text-[28px] font-extrabold text-[var(--text-primary)]">Privacy Policy</h1>
              <p className="text-[12px] text-[var(--text-tertiary)] font-medium">Effective Date: August 2026</p>
            </div>
          </div>

          <div className="prose prose-sm max-w-none space-y-8 text-[14px] leading-relaxed text-[var(--text-secondary)]">
            <section>
              <h2 className="text-[18px] font-bold text-[var(--text-primary)] mb-3">1. Introduction</h2>
              <p>
                NexusFinance ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and web platform (collectively, the "Service").
              </p>
              <p className="mt-2">
                By using the Service, you agree to the collection and use of information in accordance with this policy. If you do not agree, please discontinue use of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[var(--text-primary)] mb-3">2. Information We Collect</h2>
              <h3 className="text-[15px] font-bold text-[var(--text-primary)] mt-4 mb-2">Personal Information</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Full name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Password (stored securely using bcrypt hashing)</li>
              </ul>

              <h3 className="text-[15px] font-bold text-[var(--text-primary)] mt-4 mb-2">Financial Information</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Loan application details (amount, type, purpose, income)</li>
                <li>Credit score and repayment history</li>
                <li>Transaction records and payment history</li>
              </ul>

              <h3 className="text-[15px] font-bold text-[var(--text-primary)] mt-4 mb-2">Identity Verification Documents</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Government-issued ID documents uploaded for KYC verification</li>
                <li>Document metadata (upload date, document type)</li>
              </ul>

              <h3 className="text-[15px] font-bold text-[var(--text-primary)] mt-4 mb-2">Technical Information</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Telegram chat ID (only if you choose to link your Telegram account)</li>
                <li>Authentication tokens and session data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[var(--text-primary)] mb-3">3. How We Use Your Information</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>To process and evaluate loan applications</li>
                <li>To verify your identity and prevent fraud</li>
                <li>To communicate with you about your account, loans, and payments</li>
                <li>To send payment reminders and notifications via Telegram (if linked)</li>
                <li>To comply with legal and regulatory requirements</li>
                <li>To improve and maintain the Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[var(--text-primary)] mb-3">4. Data Sharing</h2>
              <p>We do not sell your personal information. We may share your information with:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong>Payment Processors:</strong> ABA PayWay and Bakong payment systems to process loan repayments</li>
                <li><strong>Communication Services:</strong> Brevo (for email), Twilio (for SMS), and Telegram (for notifications) to deliver account-related communications</li>
                <li><strong>Legal Authorities:</strong> When required by law, regulation, or valid legal process</li>
                <li><strong>Service Providers:</strong> Supabase (database hosting) and Vercel (application hosting) as infrastructure providers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[var(--text-primary)] mb-3">5. Data Security</h2>
              <p>
                We implement industry-standard security measures to protect your data, including:
              </p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>bcrypt password hashing</li>
                <li>JWT-based authentication with token expiration</li>
                <li>HTTPS encryption for all data in transit</li>
                <li>Rate limiting on authentication endpoints</li>
                <li>Role-based access controls</li>
              </ul>
              <p className="mt-2">
                However, no method of electronic transmission or storage is 100% secure. We cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[var(--text-primary)] mb-3">6. Data Retention</h2>
              <p>
                We retain your personal information for as long as your account is active or as needed to provide the Service. Financial records and transaction data may be retained for a longer period to comply with legal and regulatory requirements in the Kingdom of Cambodia.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[var(--text-primary)] mb-3">7. Your Rights</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Access:</strong> You can view your personal information via the Profile page</li>
                <li><strong>Correction:</strong> You can update your name, email, and phone number via the Profile page</li>
                <li><strong>Deletion:</strong> You can request account deletion via the Profile page or by contacting support</li>
                <li><strong>Export:</strong> You can request a copy of your data by contacting support</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[var(--text-primary)] mb-3">8. Children's Privacy</h2>
              <p>
                The Service is not intended for individuals under the age of 18. We do not knowingly collect personal information from children.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[var(--text-primary)] mb-3">9. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Effective Date" above.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[var(--text-primary)] mb-3">10. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us through the Support section of the app or email us at support@nexusfinance.app.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
