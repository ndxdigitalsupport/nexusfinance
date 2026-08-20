import React, { useState } from 'react';
import { apiFetch } from '../api';
import { showToast } from './Toast';
import Heading from './Heading';
import { Phone, Mail, Clock, MapPin, Send, Globe, MessageCircle } from 'lucide-react';

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
    <div className="animate-in fade-in duration-200 max-w-4xl mx-auto space-y-6">
      <Heading>Support & Contact</Heading>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: Get in touch contact card (Spans 5) */}
        <div className="md:col-span-5 bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-xs relative overflow-hidden group">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-[var(--accent)]/5 rounded-full blur-2xl transition-all duration-300 group-hover:scale-110" />
          
          <div className="space-y-5 relative z-10">
            <div>
              <h3 className="text-[17px] font-sans font-bold text-[var(--text-primary)]">
                📍 Get in Touch
              </h3>
              <p className="text-[12px] text-[var(--text-secondary)] mt-1">Our team is here to assist you with any questions or issues.</p>
            </div>

            <div className="space-y-4">
              <a href="tel:+85581968581" className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-[var(--surface-secondary)]/50 transition border border-transparent hover:border-[var(--border-primary)] group/item">
                <div className="p-2 bg-[var(--surface-secondary)] rounded-lg text-[var(--accent)] group-hover/item:bg-[var(--accent)]/10 transition-colors">
                  <Phone className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-extrabold text-[var(--text-tertiary)] block">Phone Number</span>
                  <span className="text-[14px] font-semibold text-[var(--text-primary)] group-hover/item:text-[var(--accent)] transition-colors">+855 81 968 581</span>
                </div>
              </a>

              <a href="https://t.me/Nexusfinance_Support" target="_blank" rel="noopener noreferrer" className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-[var(--surface-secondary)]/50 transition border border-transparent hover:border-[var(--border-primary)] group/item">
                <div className="p-2 bg-[var(--surface-secondary)] rounded-lg text-[var(--accent)] group-hover/item:bg-[var(--accent)]/10 transition-colors">
                  <MessageCircle className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-extrabold text-[var(--text-tertiary)] block">Telegram</span>
                  <span className="text-[14px] font-semibold text-[var(--text-primary)] group-hover/item:text-[var(--accent)] transition-colors">@Nexusfinance_Support</span>
                </div>
              </a>

              <a href="mailto:support@nexusfinance.asia" className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-[var(--surface-secondary)]/50 transition border border-transparent hover:border-[var(--border-primary)] group/item">
                <div className="p-2 bg-[var(--surface-secondary)] rounded-lg text-[var(--accent)] group-hover/item:bg-[var(--accent)]/10 transition-colors">
                  <Mail className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-extrabold text-[var(--text-tertiary)] block">Email Support</span>
                  <span className="text-[14px] font-semibold text-[var(--text-primary)] group-hover/item:text-[var(--accent)] transition-colors">support@nexusfinance.asia</span>
                </div>
              </a>

              <a href="https://www.nexusfinance.asia" target="_blank" rel="noopener noreferrer" className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-[var(--surface-secondary)]/50 transition border border-transparent hover:border-[var(--border-primary)] group/item">
                <div className="p-2 bg-[var(--surface-secondary)] rounded-lg text-[var(--accent)] group-hover/item:bg-[var(--accent)]/10 transition-colors">
                  <Globe className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-extrabold text-[var(--text-tertiary)] block">Official Website</span>
                  <span className="text-[14px] font-semibold text-[var(--text-primary)] group-hover/item:text-[var(--accent)] transition-colors">www.nexusfinance.asia</span>
                </div>
              </a>

              <div className="flex items-start gap-3.5 p-3 rounded-xl">
                <div className="p-2 bg-[var(--surface-secondary)] rounded-lg text-[var(--accent)]">
                  <MapPin className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-extrabold text-[var(--text-tertiary)] block">Corporate Address</span>
                  <span className="text-[13.5px] font-semibold text-[var(--text-primary)] leading-relaxed block">OCIC, Phnom Penh, Cambodia</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-xl">
                <div className="p-2 bg-[var(--surface-secondary)] rounded-lg text-[var(--accent)]">
                  <Clock className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-extrabold text-[var(--text-tertiary)] block">Business Hours</span>
                  <span className="text-[13.5px] font-semibold text-[var(--text-primary)]">Mon–Fri, 8:00 AM – 5:00 PM ICT</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Send a message contact form (Spans 7) */}
        <div className="md:col-span-7 bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl p-6 space-y-5 shadow-xs">
          <div>
            <h3 className="text-[17px] font-sans font-bold text-[var(--text-primary)] flex items-center gap-2">
              ✉️ Send a Message
            </h3>
            <p className="text-[12px] text-[var(--text-secondary)] mt-1">Leave us a message, and our helpdesk will respond to you within 24 hours.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] uppercase tracking-wider font-extrabold text-[var(--text-secondary)]">Your Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="e.g. John Doe" 
                  required 
                  className="w-full bg-[var(--surface-secondary)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all font-sans" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] uppercase tracking-wider font-extrabold text-[var(--text-secondary)]">Your Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="name@company.com" 
                  required 
                  className="w-full bg-[var(--surface-secondary)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all font-sans" 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase tracking-wider font-extrabold text-[var(--text-secondary)]">Message Details</label>
              <textarea 
                value={message} 
                onChange={e => setMessage(e.target.value)} 
                placeholder="How can we help you today?" 
                rows={5} 
                required 
                className="w-full bg-[var(--surface-secondary)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all resize-none font-sans" 
              />
            </div>

            <div className="flex justify-end pt-2">
              <button 
                type="submit" 
                className="px-6 py-3 premium-btn-primary text-white rounded-xl text-[14px] font-bold cursor-pointer flex items-center gap-2 hover:shadow-lg transition duration-200"
              >
                <Send className="w-4 h-4" /> {sent ? 'Message Sent!' : 'Send Message'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
