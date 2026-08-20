// Support & Contact Portal View - c8ee6de restore
import React, { useState } from 'react';
import { apiFetch } from '../api';
import { showToast } from './Toast';
import Heading from './Heading';
import { Phone, Mail, Clock, MapPin, Send, Globe, MessageCircle, User, MessageSquare } from 'lucide-react';

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
      showToast('Message sent successfully!');
    } catch (e: any) {
      showToast(e.message || 'Failed to send message', 'error');
    }
  };

  return (
    <div className="animate-in fade-in duration-200 w-full max-w-[1200px] mx-auto space-y-8 px-2">
      
      {/* Visual Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[var(--surface-card)] to-[var(--surface-secondary)] border border-[var(--border-primary)] rounded-3xl p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--accent)]/5 rounded-full blur-3xl" />
        <div className="space-y-2 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase bg-[var(--accent)]/10 text-[var(--accent)] tracking-wider">
            Helpdesk Portal
          </span>
          <h2 className="text-[28px] md:text-[32px] font-sans font-extrabold text-[var(--text-primary)] tracking-tight">
            Support & Customer Care
          </h2>
          <p className="text-[14px] text-[var(--text-secondary)] font-medium max-w-xl leading-relaxed">
            Have questions about your loan ledger, repayment options, or automatic sweep rules? Get in touch with our Phnom Penh desk or leave a message.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: Get in touch contact card (Spans 5) */}
        <div className="lg:col-span-5 bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-3xl p-8 flex flex-col justify-between space-y-6 shadow-xs relative overflow-hidden group">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-[var(--accent)]/5 rounded-full blur-2xl transition-all duration-300 group-hover:scale-110" />
          
          <div className="space-y-6 relative z-10">
            <div>
              <h3 className="text-[18px] font-sans font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                📍 Get in Touch
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4.5">
              <a href="tel:+85581968581" className="flex items-center gap-4 p-4 rounded-2xl hover:bg-[var(--surface-secondary)]/50 transition border border-transparent hover:border-[var(--border-primary)] group/item">
                <div className="p-3 bg-[var(--surface-secondary)] rounded-xl text-[var(--accent)] group-hover/item:bg-[var(--accent)]/10 transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-extrabold text-[var(--text-tertiary)] block">Phone Number</span>
                  <span className="text-[15px] font-bold text-[var(--text-primary)] group-hover/item:text-[var(--accent)] transition-colors">+855 81 968 581</span>
                </div>
              </a>

              <a href="https://t.me/Nexusfinance_Support" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl hover:bg-[var(--surface-secondary)]/50 transition border border-transparent hover:border-[var(--border-primary)] group/item">
                <div className="p-3 bg-[var(--surface-secondary)] rounded-xl text-[var(--accent)] group-hover/item:bg-[var(--accent)]/10 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-extrabold text-[var(--text-tertiary)] block">Telegram Support</span>
                  <span className="text-[15px] font-bold text-[var(--text-primary)] group-hover/item:text-[var(--accent)] transition-colors">@Nexusfinance_Support</span>
                </div>
              </a>

              <a href="mailto:support@nexusfinance.asia" className="flex items-center gap-4 p-4 rounded-2xl hover:bg-[var(--surface-secondary)]/50 transition border border-transparent hover:border-[var(--border-primary)] group/item">
                <div className="p-3 bg-[var(--surface-secondary)] rounded-xl text-[var(--accent)] group-hover/item:bg-[var(--accent)]/10 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-extrabold text-[var(--text-tertiary)] block">Email Support</span>
                  <span className="text-[15px] font-bold text-[var(--text-primary)] group-hover/item:text-[var(--accent)] transition-colors">support@nexusfinance.asia</span>
                </div>
              </a>

              <a href="https://www.nexusfinance.asia" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl hover:bg-[var(--surface-secondary)]/50 transition border border-transparent hover:border-[var(--border-primary)] group/item">
                <div className="p-3 bg-[var(--surface-secondary)] rounded-xl text-[var(--accent)] group-hover/item:bg-[var(--accent)]/10 transition-colors">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-extrabold text-[var(--text-tertiary)] block">Official Website</span>
                  <span className="text-[15px] font-bold text-[var(--text-primary)] group-hover/item:text-[var(--accent)] transition-colors">www.nexusfinance.asia</span>
                </div>
              </a>

              <div className="flex items-center gap-4 p-4 rounded-2xl">
                <div className="p-3 bg-[var(--surface-secondary)] rounded-xl text-[var(--accent)]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-extrabold text-[var(--text-tertiary)] block">Corporate Address</span>
                  <span className="text-[14px] font-bold text-[var(--text-primary)] leading-normal block">OCIC, Phnom Penh, Cambodia</span>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl">
                <div className="p-3 bg-[var(--surface-secondary)] rounded-xl text-[var(--accent)]">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-extrabold text-[var(--text-tertiary)] block">Business Hours</span>
                  <span className="text-[14px] font-bold text-[var(--text-primary)]">Mon–Fri, 8:00 AM – 5:00 PM ICT</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Send a message contact form (Spans 7) */}
        <div className="lg:col-span-7 bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-3xl p-8 flex flex-col justify-between shadow-xs relative">
          
          <div className="space-y-6">
            <div>
              <h3 className="text-[18px] font-sans font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                ✉️ Send a Message
              </h3>
              <p className="text-[12px] text-[var(--text-secondary)] mt-1">Leave us a message, and our helpdesk will respond to you within 24 hours.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[11px] uppercase tracking-wider font-extrabold text-[var(--text-secondary)]">Your Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-tertiary)]">
                      <User className="w-4 h-4" />
                    </div>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      placeholder="Enter your name" 
                      required 
                      className="w-full bg-[var(--surface-secondary)] border border-[var(--border-primary)] rounded-xl pl-11 pr-4 py-3.5 text-[14px] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all font-sans" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] uppercase tracking-wider font-extrabold text-[var(--text-secondary)]">Your Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-tertiary)]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input 
                      type="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      placeholder="Enter your email" 
                      required 
                      className="w-full bg-[var(--surface-secondary)] border border-[var(--border-primary)] rounded-xl pl-11 pr-4 py-3.5 text-[14px] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all font-sans" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] uppercase tracking-wider font-extrabold text-[var(--text-secondary)]">Message Details</label>
                <div className="relative">
                  <div className="absolute top-3.5 left-3.5 pointer-events-none text-[var(--text-tertiary)]">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <textarea 
                    value={message} 
                    onChange={e => setMessage(e.target.value)} 
                    placeholder="Enter your message" 
                    rows={6} 
                    required 
                    className="w-full bg-[var(--surface-secondary)] border border-[var(--border-primary)] rounded-xl pl-11 pr-4 py-3.5 text-[14px] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all resize-none font-sans" 
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  type="submit" 
                  className="px-8 py-4 premium-btn-primary text-white rounded-xl text-[14px] font-bold cursor-pointer flex items-center gap-2 hover:shadow-lg hover:brightness-105 active:scale-98 transition duration-200"
                >
                  <Send className="w-4 h-4" /> {sent ? 'Message Sent!' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
