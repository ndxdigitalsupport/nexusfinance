import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Lock, 
  User, 
  Phone, 
  Mail, 
  Globe, 
  HelpCircle, 
  RefreshCw, 
  CheckCircle2,
} from 'lucide-react';
import { showToast } from './Toast';
import { API } from '../api';

async function authFetch(path: string, body: any) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

interface AuthPageProps {
  onLoginSuccess: (token: string) => void;
}

type AuthView = 'login' | 'register' | 'forgot' | 'check-email';

export default function AuthPage({ onLoginSuccess }: AuthPageProps) {
  const [view, setView] = useState<AuthView>('login');
  
  // Login states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Register states
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerDone, setRegisterDone] = useState(false);

  // Loading states
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  // Password strength
  const getPasswordStrength = (pw: string): { score: number; label: string; color: string } => {
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { score: 1, label: 'Weak', color: '#EF4444' };
    if (score <= 2) return { score: 2, label: 'Fair', color: '#F59E0B' };
    if (score <= 3) return { score: 3, label: 'Good', color: '#3B82F6' };
    return { score: 4, label: 'Strong', color: '#10B981' };
  };
  const passwordStrength = registerPassword ? getPasswordStrength(registerPassword) : null;

  // Login handler — calls server API with bcrypt password verification
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const data = await authFetch('/auth/login', { email: loginEmail, password: loginPassword });
      onLoginSuccess(data.token);
    } catch (err: any) {
      showToast(err?.message || 'Login failed. Check your credentials.', 'error');
    } finally {
      setLoginLoading(false);
    }
  };

  // Register handler — calls server API with bcrypt password hashing
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerPassword !== registerConfirmPassword) return showToast('Passwords do not match', 'error');
    if (registerPassword.length < 6) return showToast('Password must be at least 6 characters', 'error');
    setRegisterLoading(true);
    try {
      const data = await authFetch('/auth/register', {
        name: registerName,
        email: registerEmail,
        password: registerPassword,
        phone: registerPhone || undefined,
      });

      // Trigger Appwrite verification email
      try {
        const { account } = await import('../appwriteClient');
        await account.createEmailPasswordSession(registerEmail, registerPassword);
        await account.createVerification(window.location.origin + '/verify');
      } catch (awErr) {
        console.warn('Appwrite verification trigger failed:', awErr);
      }

      showToast('Account created! Check your email to verify.', 'success');
      setRegisterDone(true);
      setView('check-email');
    } catch (err: any) {
      showToast(err?.message || 'Registration failed.', 'error');
    } finally {
      setRegisterLoading(false);
    }
  };

  // Forgot password handler — calls server API
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return showToast('Enter your email address', 'error');
    setLoginLoading(true);
    try {
      await authFetch('/auth/forgot-password', { email: forgotEmail });
      setForgotSent(true);
    } catch (err: any) {
      showToast(err?.message || 'Failed to send recovery email.', 'error');
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="h-screen grid grid-rows-[auto_1fr_auto] bg-gradient-to-tr from-[#e3f4f0] via-[#edf7f5] to-[#f4faff] select-none text-[var(--text-primary)] font-sans relative auth-page overflow-hidden">
      
      {/* Background soft glowing decorative orbs */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-[#c0f5ea]/40 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-150px] right-[-100px] w-[600px] h-[600px] rounded-full bg-[#d0effa]/50 blur-[130px] pointer-events-none z-0" />

      {/* VIEW: LOGIN */}
      {view === 'login' && (
        <React.Fragment key="login">
          {/* Header */}
          <header className="relative z-10 px-6 py-5 sm:px-12 flex justify-between items-center bg-transparent">
            <div className="flex items-center gap-2">
              <span className="font-sans text-[20px] tracking-tight flex items-center">
                <span className="text-[var(--text-primary)] font-black">Nexus</span>
                <span className="text-[var(--text-secondary)] font-light">Finance</span>
              </span>
            </div>
            <button 
              onClick={() => {}} 
              className="text-[var(--text-tertiary)] font-semibold text-[14px] hover:text-[var(--text-primary)]"
            >
              Support
            </button>
          </header>

          {/* Main content grid */}
          <main className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center px-6 sm:px-12 max-w-7xl mx-auto w-full gap-8 lg:gap-16 py-4">
            
            {/* Form Left Row (Column 5) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-start">
              <div className="bg-[var(--surface-card)]/80 backdrop-blur-xl rounded-3xl p-8 sm:p-10 w-full max-w-md shadow-2xl shadow-teal-900/5 border border-[var(--border-primary)]/60 animate-in fade-in slide-in-from-left duration-500">
                
                {/* Title block */}
                <div className="text-center mb-8">
                  <h2 className="text-[36px] font-extrabold tracking-tight text-[var(--text-primary)]">Login</h2>
                  <p className="text-[14px] text-[var(--text-secondary)] font-medium mt-1 leading-none">welcome to nexus finance</p>
                </div>

                {/* Form fields */}
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="Email / Username"
                      className="w-full rounded-2xl bg-[var(--surface-card)] border border-[var(--border-primary)]/90 px-6 py-3.5 text-[14px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)]/80 focus:ring-2 focus:ring-[var(--accent)]/20 font-medium transition-all"
                      required
                    />
                  </div>

                  <div>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full rounded-2xl bg-[var(--surface-card)] border border-[var(--border-primary)]/90 px-6 py-3.5 text-[14px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)]/80 focus:ring-2 focus:ring-[var(--accent)]/20 font-mono transition-all"
                      required
                    />
                  </div>

                  {/* Utilities */}
                  <div className="flex justify-between items-center text-[13px] px-2 py-1 select-none font-medium">
                    <label className="flex items-center gap-2 text-[var(--text-secondary)] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4.5 h-4.5 rounded text-[var(--accent)] border-[var(--border-primary)] focus:ring-[var(--accent)]"
                      />
                      <span>Remember me</span>
                    </label>
                    <button type="button" onClick={() => { setForgotEmail(loginEmail); setView('forgot'); }} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer">
                      Forgot Password?
                    </button>
                  </div>

                  {/* Submition button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--text-primary)] font-black text-[15.5px] tracking-wide py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[var(--accent)]/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                      {loginLoading ? (
                        <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> SIGNING IN...</span>
                      ) : (
                        <>LOGIN <ArrowRight className="w-5 h-5 stroke-[2.5]" /></>
                      )}
                    </button>
                  </div>
                </form>

                {/* Create account trigger */}
                <div className="text-center mt-6 text-[13.5px] font-semibold text-[var(--text-secondary)]">
                  <span>Don’t have an account? </span>
                  <button 
                    onClick={() => setView('register')}
                    className="text-[var(--text-primary)] underline hover:text-[var(--accent-hover)] cursor-pointer font-bold"
                  >
                    create account
                  </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 my-6">
                  <div className="h-[1px] bg-[var(--border-primary)] flex-grow" />
                  <span className="text-[11px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider">or</span>
                  <div className="h-[1px] bg-[var(--border-primary)] flex-grow" />
                </div>

                {/* Google Sign In — redirects to real Google OAuth */}
                <button
                  type="button"
                  onClick={() => window.location.href = API + '/auth/google'}
                  className="w-full bg-[var(--surface-card)] hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] border border-[var(--border-primary)] font-bold text-[14px] py-3 px-6 rounded-2xl flex items-center justify-center gap-2.5 transition active:scale-95 shadow-xs cursor-pointer"
                >
                  <svg className="w-4 h-4 mr-0.5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.61c-.29 1.5-.14 3.01-.97 4.29l3.1 2.4c1.8-1.66 2.8-4.11 2.8-6.54z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.1-2.4c-.9.6-2.01.99-3.23.99-3.11 0-5.74-2.11-6.68-4.96l-3.2 2.48C5.69 21.09 8.63 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.32 14.72a7.16 7.16 0 0 1 0-4.55l-3.2-2.48a11.94 11.94 0 0 0 0 10.43l3.2-2.4c-.38-.3-.38-.7-.38-1z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 8.63 0 5.69 2.91 3.72 6.79l3.2 2.48C7.86 6.36 10.49 4.75 12 4.75z"
                    />
                  </svg>
                  Sign in with Google
                </button>

              </div>
            </div>

            {/* Isometric 3D Illustration Right (Column 7) */}
            <div className="lg:col-span-7 hidden lg:flex justify-center items-center h-full max-h-[600px] select-none pointer-events-none relative">
              <svg
                viewBox="0 0 800 600"
                className="w-full max-w-[620px] h-auto drop-shadow-2xl animate-in zoom-in duration-700"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Perspective Grid Floor */}
                <g opacity="0.3">
                  <path d="M 100,500 L 400,200 L 700,500 M 400,200 L 400,580" stroke="#5CF2D0" strokeWidth="1.5" strokeDasharray="5,5" />
                  <path d="M 200,400 L 600,400 M 250,450 L 550,450" stroke="#00bfa5" strokeWidth="1" />
                </g>

                {/* Glassmorphic Rounded 3D Smartphone Device Mockup */}
                <g transform="translate(180, 50)">
                  {/* Smartphone Body Silhouette & Outer Frame shadow */}
                  <rect x="150" y="50" width="220" height="420" rx="40" fill="white" fillOpacity="0.45" stroke="white" strokeWidth="4" className="backdrop-blur-lg" />
                  <rect x="156" y="56" width="208" height="408" rx="34" fill="url(#device-grad)" opacity="0.9" />

                  {/* Reflection highlights */}
                  <path d="M 156,56 L 364,200 L 364,240 L 156,96 Z" fill="white" opacity="0.12" />

                  {/* UI Screens inside mock device container */}
                  <g transform="translate(176, 84)">
                    {/* Floating top bar */}
                    <rect x="10" y="10" width="160" height="28" rx="8" fill="white" fillOpacity="0.15" />
                    <circle cx="28" cy="24" r="6" fill="#5CF2D0" />
                    <rect x="42" y="20" width="80" height="8" rx="4" fill="white" fillOpacity="0.3" />

                    {/* Balance box card */}
                    <rect x="10" y="50" width="160" height="74" rx="16" fill="white" fillOpacity="0.25" stroke="white" strokeWidth="1.5" className="backdrop-blur-md" />
                    <rect x="24" y="66" width="50" height="8" rx="4" fill="white" fillOpacity="0.4" />
                    <rect x="24" y="82" width="110" height="18" rx="6" fill="#5CF2D0" />
                    {/* Tiny stats graph symbol */}
                    <path d="M 24,110 L 50,102 L 76,108 L 102,96 L 128,104" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Chart columns inside phone screen */}
                    <g transform="translate(10, 140)">
                      <rect x="0" y="0" width="160" height="96" rx="16" fill="white" fillOpacity="0.1" />
                      <rect x="16" y="70" width="16" height="14" rx="3" fill="#5CF2D0" />
                      <rect x="42" y="50" width="16" height="34" rx="3" fill="white" fillOpacity="0.6" />
                      <rect x="68" y="30" width="16" height="54" rx="3" fill="#00b6ff" />
                      <rect x="94" y="44" width="16" height="40" rx="3" fill="#5CF2D0" />
                      <rect x="120" y="15" width="16" height="69" rx="3" fill="white" />
                    </g>

                    {/* Mini button actions */}
                    <rect x="10" y="250" width="42" height="42" rx="12" fill="white" fillOpacity="0.4" />
                    <rect x="68" y="250" width="42" height="42" rx="12" fill="#5CF2D0" />
                    <rect x="126" y="250" width="42" height="42" rx="12" fill="white" fillOpacity="0.4" />
                  </g>
                </g>

                {/* Floating Isometric 3D Boards & Grids */}
                {/* 3D Glass Dashboard in foreground left */}
                <g className="animate-bounce" style={{ animationDuration: '6s' }}>
                  <polygon points="120,400 280,320 320,380 160,460" fill="white" fillOpacity="0.7" stroke="white" strokeWidth="2" />
                  <polygon points="135,410 215,370 235,400 155,440" fill="url(#chart-grad-green)" opacity="0.8" />
                  <circle cx="260" cy="360" r="12" fill="#00bfa5" />
                  <circle cx="160" cy="420" r="6" fill="#00796b" />
                  {/* Micro indicator line block */}
                  <line x1="175" y1="415" x2="230" y2="388" stroke="#00796b" strokeWidth="4" />
                </g>

                {/* Isometric 3D Platform Right Charts stand */}
                <g transform="translate(480, 260)">
                  <polygon points="0,150 160,70 200,90 40,170" fill="white" fillOpacity="0.4" stroke="white" strokeWidth="1" />
                  
                  {/* Columns stacked in 3D perspective */}
                  <g transform="translate(20, 80)">
                    {/* Prism 1 */}
                    <path d="M 20,40 L 40,30 L 40,0 L 20,10 Z M 40,30 L 60,20 L 60,-10 L 40,0 Z" fill="#5CF2D0" />
                    <polygon points="20,10 40,0 60,-10 40,-20" fill="#4effdf" />
                    {/* Shadow prism */}
                    <path d="M 20,40 L 40,30 L 60,20" stroke="white" opacity="0.4" />
                  </g>

                  <g transform="translate(70, 50)">
                    {/* Prism 2 - taller */}
                    <path d="M 20,50 L 40,40 L 40,-30 L 20,-20 Z M 40,40 L 60,30 L 60,-40 L 40,-30 Z" fill="#00b6ff" />
                    <polygon points="20,-20 40,-30 60,-40 40,-50" fill="#69d4ff" />
                  </g>

                  <g transform="translate(120, 20)">
                    {/* Prism 3 */}
                    <path d="M 20,35 L 40,25 L 40,-5 L 20,5 Z M 40,25 L 60,15 L 60,-15 L 40,-5 Z" fill="#5CF2D0" />
                    <polygon points="20,5 40,-5 60,-15 40,-25" fill="#4effdf" />
                  </g>
                </g>

                {/* Floating Micro elements */}
                <g transform="translate(160, 240)">
                  <polygon points="10,20 30,10 40,25 20,35" fill="#5CF2D0" opacity="0.4" />
                </g>
                <g transform="translate(490, 100)">
                  <polygon points="0,40 40,20 60,50 20,70" fill="#00b6ff" opacity="0.3" />
                  <rect x="20" y="30" width="20" height="20" rx="6" fill="white" fillOpacity="0.7" className="backdrop-blur-xs" />
                </g>

                {/* Character Icon overlay standing right dashboard */}
                <g transform="translate(560, 160)">
                  {/* Styled minimalist figure representant */}
                  <circle cx="50" cy="60" r="16" fill="#1e293b" /> {/* Head */}
                  <path d="M 20,110 C 20,85 40,80 50,80 C 60,80 80,85 80,110 L 74,230 C 74,240 68,245 58,245 C 50,245 42,240 42,230 Z" fill="#3b82f6" /> {/* Body */}
                  
                  {/* Floating handheld glass panel tablet */}
                  <g transform="translate(10, 80)">
                    <rect x="-35" y="10" width="55" height="34" rx="6" fill="#4effdf" fillOpacity="0.8" stroke="white" strokeWidth="1.5" />
                    <line x1="-25" y1="20" x2="-5" y2="20" stroke="#1e293b" strokeWidth="2.5" />
                    <line x1="-25" y1="28" x2="5" y2="28" stroke="#1e293b" strokeWidth="1.5" />
                  </g>
                  {/* Interacting visual lines */}
                  <path d="M -10,100 C -40,110 -60,90 -90,120" stroke="#5CF2D0" strokeWidth="2" strokeDasharray="4,4" />
                </g>

                <defs>
                  <linearGradient id="device-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#0a2c42" />
                    <stop offset="100%" stopColor="#1e293b" />
                  </linearGradient>
                  <linearGradient id="chart-grad-green" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#5CF2D0" />
                    <stop offset="100%" stopColor="#004d40" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

          </main>

          {/* Footer of Login Screen */}
          <footer className="relative z-10 px-6 py-6 sm:px-12 border-t border-[var(--border-primary)]/50 bg-[var(--surface-card)]/40 flex flex-col md:flex-row justify-between items-center gap-4 text-[12px] font-medium text-[var(--text-secondary)]">
            <div>
              <p>© 2026 Nexus Finance. All rights reserved.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[var(--text-primary)] transition">Privacy Policy</a>
              <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[var(--text-primary)] transition">Terms of Service</a>
              <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[var(--text-primary)] transition">Regulatory Disclosure</a>
              <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[var(--text-primary)] transition">Cookie Settings</a>
              <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[var(--text-primary)] transition">Security</a>
            </div>
          </footer>
        </React.Fragment>
      )}

      {/* VIEW: REGISTER / CREATE ACCOUNT */}
      {view === 'register' && (
        <>
          {/* Header */}
          <header className="relative z-10 px-6 py-5 sm:px-12 flex justify-between items-center bg-transparent">
            <div className="flex items-center gap-2">
              <span className="font-sans text-[20px] tracking-tight flex items-center">
                <span className="text-[var(--text-primary)] font-black">Nexus</span>
                <span className="text-[var(--text-primary)] font-light">Finance</span>
              </span>
            </div>
            <div className="flex items-center gap-4 text-[var(--text-secondary)]">
              <Globe className="w-5 h-5 cursor-pointer hover:text-[var(--text-primary)]" />
              <HelpCircle className="w-5 h-5 cursor-pointer hover:text-[var(--text-primary)]" />
            </div>
          </header>

          {/* Main Container */}
          <main className="relative z-10 flex-grow flex flex-col justify-center items-center px-4 py-8">
            <h2 className="text-[32px] sm:text-[36px] font-bold text-[var(--text-primary)] mb-8 text-center tracking-tight">
              Create your account
            </h2>

            {/* Custom Create account white frame card */}
            <div className="bg-[var(--surface-card)]/80 backdrop-blur-xl rounded-[32px] shadow-xl shadow-teal-900/5 border border-[var(--border-primary)]/60 p-8 sm:p-10 w-full max-w-lg animate-in fade-in zoom-in-95 duration-300">
              <form onSubmit={handleRegisterSubmit} className="space-y-6">
                
                {/* Field: Full Name */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold uppercase text-[var(--text-secondary)] tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[var(--text-tertiary)]">
                      <User className="w-4.5 h-4.5" />
                    </div>
                    <input
                      type="text"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      placeholder="Johnathan Doe"
                      className="w-full bg-[var(--surface-secondary)] border-0 focus:bg-[var(--surface-card)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:outline-[var(--accent)]/40 rounded-2xl pl-12 pr-6 py-3.5 text-[14px] text-[var(--text-primary)] font-medium transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Field: Email Address */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold uppercase text-[var(--text-secondary)] tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[var(--text-tertiary)]">
                      <span className="text-[17px] font-light leading-none select-none">@</span>
                    </div>
                    <input
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="j.doe@nexus.finance"
                      className="w-full bg-[var(--surface-secondary)] border-0 focus:bg-[var(--surface-card)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:outline-[var(--accent)]/40 rounded-2xl pl-12 pr-6 py-3.5 text-[14px] text-[var(--text-primary)] font-medium transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Field: Password */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold uppercase text-[var(--text-secondary)] tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[var(--text-tertiary)]">
                      <Lock className="w-4.5 h-4.5" />
                    </div>
                    <input
                      type="password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-[var(--surface-secondary)] border-0 focus:bg-[var(--surface-card)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:outline-[var(--accent)]/40 rounded-2xl pl-12 pr-6 py-3.5 text-[14px] text-[var(--text-primary)] font-mono transition-all animate-none"
                      required
                    />
                  </div>

                  {/* Password Strength Indicator */}
                  {passwordStrength && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                            style={{
                              backgroundColor: i <= passwordStrength.score ? passwordStrength.color : 'var(--border-primary)',
                            }}
                          />
                        ))}
                      </div>
                      <p className="text-[11px] font-bold" style={{ color: passwordStrength.color }}>
                        {passwordStrength.label}
                      </p>
                    </div>
                  )}

                  {/* Field: Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-extrabold uppercase text-[var(--text-secondary)] tracking-wider">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[var(--text-tertiary)]">
                        <Lock className="w-4.5 h-4.5" />
                      </div>
                      <input
                        type="password"
                        value={registerConfirmPassword}
                        onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-[var(--surface-secondary)] border-0 focus:bg-[var(--surface-card)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:outline-[var(--accent)]/40 rounded-2xl pl-12 pr-6 py-3.5 text-[14px] text-[var(--text-primary)] font-mono transition-all animate-none"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Field: Phone Number */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold uppercase text-[var(--text-secondary)] tracking-wider">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[var(--text-tertiary)]">
                      <Phone className="w-4.5 h-4.5" />
                    </div>
                    <input
                      type="tel"
                      value={registerPhone}
                      onChange={(e) => setRegisterPhone(e.target.value)}
                      placeholder="+855 12 345 678"
                      className="w-full bg-[var(--surface-secondary)] border-0 focus:bg-[var(--surface-card)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:outline-[var(--accent)]/40 rounded-2xl pl-12 pr-6 py-3.5 text-[14px] text-[var(--text-primary)] font-medium transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Button Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={registerLoading}
                    className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--text-primary)] font-bold text-[15.5px] py-4 rounded-2xl flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {registerLoading ? (
                      <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> CREATING...</span>
                    ) : (
                      <>Create Account <ArrowRight className="w-5 h-5 stroke-[2.5]" /></>
                    )}
                  </button>
                </div>
              </form>

              {/* Already have accounts */}
              <div className="text-center mt-6 text-[13.5px] font-semibold text-[var(--text-secondary)]">
                <span>Already have an account? </span>
                <button 
                  onClick={() => setView('login')}
                  className="text-[var(--text-primary)] hover:text-[var(--accent-hover)] cursor-pointer font-bold ml-0.5"
                >
                  Log In
                </button>
              </div>

            </div>
          </main>

          {/* Footer of Create Account page */}
          <footer className="relative z-10 px-6 py-6 sm:px-12 border-t border-[var(--border-primary)]/50 bg-[var(--surface-card)]/40 flex flex-col md:flex-row justify-between items-center gap-4 text-[12px] font-semibold tracking-wide text-[var(--text-secondary)]">
            <div>
              <p>© 2026 Nexus Finance. All rights reserved.</p>
            </div>
            <div className="flex gap-6">
              <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[var(--text-primary)] transition">Privacy Policy</a>
              <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[var(--text-primary)] transition">Terms of Service</a>
              <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[var(--text-primary)] transition">Security</a>
            </div>
          </footer>
        </>
      )}

      {/* VIEW: CHECK EMAIL (after registration) */}
      {view === 'check-email' && (
        <div className="min-h-screen flex flex-col justify-between w-full h-full">
          <div className="flex-grow flex flex-col justify-center items-center px-4 py-8">
            <div className="bg-[var(--surface-card)]/90 backdrop-blur-xl rounded-[32px] border border-[var(--border-primary)]/80 p-8 sm:p-12 w-full max-w-lg shadow-xl shadow-teal-900/5 flex flex-col items-center animate-in zoom-in-95 duration-200">
              <div className="relative w-16 h-16 bg-[var(--surface-secondary)] rounded-full flex items-center justify-center text-[var(--text-secondary)] border border-[var(--border-primary)]/10 mb-6">
                <Mail className="w-7 h-7" />
                <div className="absolute top-1 right-1 w-4 h-4 bg-[var(--accent)] rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-[var(--text-primary)]" />
                </div>
              </div>
              <h2 className="text-[28px] sm:text-[32px] font-bold text-[var(--text-primary)] text-center tracking-tight">
                Check your email
              </h2>
              <p className="text-[13px] text-[var(--text-secondary)] font-medium text-center mt-3 mb-8 max-w-sm leading-relaxed">
                We've sent a verification link to your email.<br />
                Please check your inbox and click the link to verify your account.
              </p>
              <button
                onClick={() => { setView('login'); setRegisterDone(false); }}
                className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--text-primary)] font-bold py-4 rounded-2xl transition active:scale-95 shadow-md hover:shadow-lg text-[15px] cursor-pointer"
              >
                GO TO SIGN IN <ArrowRight className="w-5 h-5 stroke-[2.5] inline ml-1" />
              </button>
              <div className="w-full flex justify-center text-[13px] font-bold text-[var(--text-secondary)] mt-6 pt-6 border-t border-[var(--border-primary)] select-none">
                <button onClick={() => setView('register')} className="hover:text-[var(--text-primary)] cursor-pointer">
                  Use a different email
                </button>
              </div>
            </div>
          </div>
          <footer className="relative z-10 px-6 py-6 sm:px-12 bg-transparent flex justify-center text-[11.5px] font-semibold text-[var(--text-secondary)]/60">
            <p>© 2026 Nexus Finance. All rights reserved.</p>
          </footer>
        </div>
      )}

      {view === 'forgot' && (
        <div className="min-h-screen flex flex-col justify-between w-full h-full">
          <div className="flex-grow flex flex-col justify-center items-center px-4 py-8">
            <div className="bg-[var(--surface-card)]/90 backdrop-blur-xl rounded-[32px] border border-[var(--border-primary)]/80 p-8 sm:p-12 w-full max-w-lg shadow-xl shadow-teal-900/5 flex flex-col items-center animate-in zoom-in-95 duration-200">

              <div className="relative w-16 h-16 bg-[var(--surface-secondary)] rounded-full flex items-center justify-center text-[var(--text-secondary)] border border-[var(--border-primary)]/10 mb-6">
                <Lock className="w-7 h-7" />
              </div>

              <h2 className="text-[28px] sm:text-[32px] font-bold text-[var(--text-primary)] text-center tracking-tight">
                Reset Password
              </h2>
              <p className="text-[13px] text-[var(--text-secondary)] font-medium text-center mt-3 mb-8 max-w-sm leading-relaxed">
                {forgotSent
                  ? 'If an account exists with that email, we\'ve sent a password reset link.'
                  : 'Enter your email and we\'ll send you a password reset link.'}
              </p>

              {!forgotSent ? (
                <form onSubmit={handleForgotSubmit} className="w-full space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase tracking-wider ml-1">Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <Lock className="w-4 h-4 text-[var(--text-tertiary)]" />
                      </div>
                      <input
                        type="email"
                        placeholder="your@email.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3.5 bg-[var(--surface-card)]/90 border border-[var(--border-primary)]/90 rounded-2xl text-[14px] font-medium focus:outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10 text-[var(--text-primary)] transition-all"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--text-primary)] font-bold py-4 rounded-2xl flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md hover:shadow-lg text-[15px] cursor-pointer"
                  >
                    SEND RESET LINK <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setView('login')}
                  className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--text-primary)] font-bold py-4 rounded-2xl transition active:scale-95 shadow-md hover:shadow-lg text-[15px] cursor-pointer"
                >
                  BACK TO LOGIN
                </button>
              )}

              <div className="w-full flex justify-between items-center text-[13px] font-bold text-[var(--text-secondary)] mt-8 pt-6 border-t border-[var(--border-primary)] select-none">
                <button onClick={() => setView('login')} className="hover:text-[var(--text-primary)] cursor-pointer">
                  ← Back to Login
                </button>
                <button onClick={() => setView('register')} className="hover:text-[var(--text-primary)] cursor-pointer">
                  Create Account
                </button>
              </div>
            </div>
          </div>
          <footer className="relative z-10 px-6 py-6 sm:px-12 bg-transparent flex justify-center text-[11.5px] font-semibold text-[var(--text-secondary)]/60">
            <p>© 2026 Nexus Finance. All rights reserved.</p>
          </footer>
        </div>
      )}

    </div>
  );
}
