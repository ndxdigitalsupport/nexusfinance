import React, { useState } from 'react';
import { apiFetch } from '../api';
import { showToast } from './Toast';
import Heading from './Heading';

export default function SupportView() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/support/message', { method: 'POST', body: JSON.stringify({ name, email, message }) });
      setSent(true);
      setTimeout(() => { setSent(false); setName(''); setEmail(''); setMessage(''); }, 3000);
    } catch (e: any) {
      showToast(e.message || 'Failed to send message', 'error');
    }
  };

  return (
    <div className="animate-in fade-in duration-200 max-w-3xl mx-auto">
      <Heading>Support & Contact</Heading>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl p-6 space-y-4">
          <h3 className="text-[15px] font-bold text-[var(--text-primary)] uppercase tracking-wider">Get in Touch</h3>
          <div className="space-y-3 text-[14px]">
            <p><span className="font-bold text-[var(--text-secondary)]">Phone:</span> +1 (800) 555-NEXUS</p>
            <p><span className="font-bold text-[var(--text-secondary)]">Email:</span> support@nexusfinance.com</p>
            <p><span className="font-bold text-[var(--text-secondary)]">Hours:</span> Mon–Fri, 9 AM – 6 PM EST</p>
            <p><span className="font-bold text-[var(--text-secondary)]">Address:</span> 100 Finance Ave, Suite 400, New York, NY 10005</p>
          </div>
        </div>
        <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl p-6 space-y-4">
          <h3 className="text-[15px] font-bold text-[var(--text-primary)] uppercase tracking-wider">Send a Message</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your Name" required className="w-full border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your Email" required className="w-full border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all" />
            <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Message" rows={4} required className="w-full border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all resize-none" />
            <button type="submit" className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--text-primary)] font-bold text-[14px] px-6 py-3 rounded-xl transition cursor-pointer">
              {sent ? 'Message Sent!' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
