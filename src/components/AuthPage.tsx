import React, { useState, useRef, useEffect } from 'react';
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

const API = 'http://localhost:3001/api';

interface AuthPageProps {
  onLoginSuccess: (token: string) => void;
}

type AuthView = 'login' | 'register' | 'verify' | 'forgot';

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
  const [pendingToken, setPendingToken] = useState<string | null>(null);

  const [verifyVia, setVerifyVia] = useState<'email' | 'phone'>('phone');

  // Loading states
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Verify states
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Verification success status trigger
  const [vSuccess, setVSuccess] = useState(false);

  // Handle verify digit change
  const handleDigitChange = (index: number, val: string) => {
    if (!/^[0-9]?$/.test(val)) return; // numbers only
    const newCode = [...code];
    newCode[index] = val;
    setCode(newCode);

    // Auto-focus next input
    if (val !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && code[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Login handler — calls the real backend API
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setLoginLoading(false); showToast(data.error || 'Login failed', 'error'); return; }
      onLoginSuccess(data.token);
    } catch {
      showToast('Could not connect to server. Is it running?', 'error');
    } finally {
      setLoginLoading(false);
    }
  };

  // Register handler
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerPassword !== registerConfirmPassword) return showToast('Passwords do not match', 'error');
    setRegisterLoading(true);
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: registerName, email: registerEmail, password: registerPassword, phone: registerPhone }),
      });
      const data = await res.json();
      if (!res.ok) { setRegisterLoading(false); showToast(data.error || 'Registration failed', 'error'); return; }
      setPendingToken(data.token);
      setVerifyVia('phone');
      setView('verify');
    } catch {
      showToast('Could not connect to server. Is it running?', 'error');
    } finally {
      setRegisterLoading(false);
    }
  };

  // Forgot password handler
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (!res.ok) return showToast(data.error || 'Request failed', 'error');
      setForgotSent(true);
      showToast('Reset link sent to your email');
    } catch {
      showToast('Could not connect to server.', 'error');
    }
  };

  // Verification code submit handler
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyLoading(true);
    try {
      const body = verifyVia === 'email'
        ? { via: 'email', email: registerEmail, code: code.join('') }
        : { via: 'phone', phone: registerPhone, code: code.join('') };
      const res = await fetch(`${API}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setVerifyLoading(false); showToast(data.error || 'Verification failed', 'error'); return; }
      setVSuccess(true);
      setTimeout(() => {
        if (pendingToken) onLoginSuccess(pendingToken);
      }, 1200);
    } catch {
      showToast('Could not connect to server.', 'error');
    } finally {
      setVerifyLoading(false);
    }
  };

  // Auto-send OTP when verify view mounts
  useEffect(() => {
    if (view === 'verify') {
      const body = verifyVia === 'email'
        ? { via: 'email', email: registerEmail }
        : { via: 'phone', phone: registerPhone };
      fetch(`${API}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).catch(() => showToast('Failed to send verification code. Try resend.', 'error'));
    }
  }, [view, verifyVia]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-tr from-[#e3f4f0] via-[#edf7f5] to-[#f4faff] select-none text-slate-800 font-sans relative overflow-x-hidden">
      
      {/* Background soft glowing decorative orbs */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-[#c0f5ea]/40 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-150px] right-[-100px] w-[600px] h-[600px] rounded-full bg-[#d0effa]/50 blur-[130px] pointer-events-none z-0" />

      {/* VIEW: LOGIN */}
      {view === 'login' && (
        <>
          {/* Header */}
          <header className="relative z-10 px-6 py-5 sm:px-12 flex justify-between items-center bg-transparent">
            <div className="flex items-center gap-2">
              <span className="font-sans text-[20px] tracking-tight flex items-center">
                <span className="text-[#0E171C] font-black">Nexus</span>
                <span className="text-[#0E171C] font-light">Finance</span>
              </span>
            </div>
            <button 
              onClick={() => {}} 
              className="text-[#44474a] font-semibold text-[14px] hover:text-[#0e171c]"
            >
              Support
            </button>
          </header>

          {/* Main content grid */}
          <main className="relative z-10 flex-grow grid grid-cols-1 lg:grid-cols-12 items-center px-6 sm:px-12 py-6 max-w-7xl mx-auto w-full gap-8 lg:gap-16">
            
            {/* Form Left Row (Column 5) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-start">
              <div className="bg-white/70 backdrop-blur-md rounded-3xl p-8 sm:p-10 w-full max-w-md shadow-2xl shadow-teal-900/5 border border-white/80 animate-in fade-in slide-in-from-left duration-500">
                
                {/* Title block */}
                <div className="text-center mb-8">
                  <h2 className="text-[36px] font-extrabold tracking-tight text-[#0e171c]">Login</h2>
                  <p className="text-[14px] text-slate-500 font-medium mt-1 leading-none">welcome to nexus finanace</p>
                </div>

                {/* Form fields */}
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="Email / Username"
                      className="w-full rounded-full bg-white border border-slate-200/90 px-6 py-3.5 text-[14px] text-slate-800 placeholder-slate-400/90 focus:outline-none focus:border-[#00e1b5]/80 focus:ring-2 focus:ring-[#00e1b5]/20 font-medium transition-all"
                      required
                    />
                  </div>

                  <div>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full rounded-full bg-white border border-slate-200/90 px-6 py-3.5 text-[14px] text-slate-800 placeholder-slate-400/90 focus:outline-none focus:border-[#00e1b5]/80 focus:ring-2 focus:ring-[#00e1b5]/20 font-mono transition-all"
                      required
                    />
                  </div>

                  {/* Utilities */}
                  <div className="flex justify-between items-center text-[13px] px-2 py-1 select-none font-medium">
                    <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4.5 h-4.5 rounded text-[#00e1b5] border-slate-300 focus:ring-[#00e1b5]"
                      />
                      <span>Remember me</span>
                    </label>
                    <button onClick={() => { setForgotEmail(loginEmail); setView('forgot'); }} className="text-slate-600 hover:text-slate-900 cursor-pointer">
                      Forgot Password?
                    </button>
                  </div>

                  {/* Submition button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="w-full bg-[#00e1b5] hover:bg-[#00f2c4] text-[#0e171c] font-black text-[15.5px] tracking-wide py-3.5 px-6 rounded-full flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-teal-400/20 active:scale-98 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
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
                <div className="text-center mt-6 text-[13.5px] font-semibold text-slate-600">
                  <span>Don’t have an account? </span>
                  <button 
                    onClick={() => setView('register')}
                    className="text-[#0e171c] underline hover:text-teal-700 cursor-pointer font-bold"
                  >
                    create account
                  </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 my-6">
                  <div className="h-[1px] bg-slate-200/70 flex-grow" />
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">or</span>
                  <div className="h-[1px] bg-slate-200/70 flex-grow" />
                </div>

                {/* Google Sign In — redirects to real Google OAuth */}
                <button
                  type="button"
                  onClick={() => window.location.href = 'http://localhost:3001/api/auth/google'}
                  className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-[14px] py-3 px-6 rounded-full flex items-center justify-center gap-2.5 transition active:scale-98 shadow-xs cursor-pointer"
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
                  <path d="M 100,500 L 400,200 L 700,500 M 400,200 L 400,580" stroke="#00e1b5" strokeWidth="1.5" strokeDasharray="5,5" />
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
                    <circle cx="28" cy="24" r="6" fill="#00e1b5" />
                    <rect x="42" y="20" width="80" height="8" rx="4" fill="white" fillOpacity="0.3" />

                    {/* Balance box card */}
                    <rect x="10" y="50" width="160" height="74" rx="16" fill="white" fillOpacity="0.25" stroke="white" strokeWidth="1.5" className="backdrop-blur-md" />
                    <rect x="24" y="66" width="50" height="8" rx="4" fill="white" fillOpacity="0.4" />
                    <rect x="24" y="82" width="110" height="18" rx="6" fill="#00e1b5" />
                    {/* Tiny stats graph symbol */}
                    <path d="M 24,110 L 50,102 L 76,108 L 102,96 L 128,104" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Chart columns inside phone screen */}
                    <g transform="translate(10, 140)">
                      <rect x="0" y="0" width="160" height="96" rx="16" fill="white" fillOpacity="0.1" />
                      <rect x="16" y="70" width="16" height="14" rx="3" fill="#00e1b5" />
                      <rect x="42" y="50" width="16" height="34" rx="3" fill="white" fillOpacity="0.6" />
                      <rect x="68" y="30" width="16" height="54" rx="3" fill="#00b6ff" />
                      <rect x="94" y="44" width="16" height="40" rx="3" fill="#00e1b5" />
                      <rect x="120" y="15" width="16" height="69" rx="3" fill="white" />
                    </g>

                    {/* Mini button actions */}
                    <rect x="10" y="250" width="42" height="42" rx="12" fill="white" fillOpacity="0.4" />
                    <rect x="68" y="250" width="42" height="42" rx="12" fill="#00e1b5" />
                    <rect x="126" y="250" width="42" height="42" rx="12" fill="white" fillOpacity="0.4" />
                  </g>
                </g>

                {/* Floating Isometric 3D Boards & Grids */}
                {/* 3D Glass Dashboard in foreground left */}
                <g class="animate-bounce" style={{ animationDuration: '6s' }}>
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
                    <path d="M 20,40 L 40,30 L 40,0 L 20,10 Z M 40,30 L 60,20 L 60,-10 L 40,0 Z" fill="#00e1b5" />
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
                    <path d="M 20,35 L 40,25 L 40,-5 L 20,5 Z M 40,25 L 60,15 L 60,-15 L 40,-5 Z" fill="#00e1b5" />
                    <polygon points="20,5 40,-5 60,-15 40,-25" fill="#4effdf" />
                  </g>
                </g>

                {/* Floating Micro elements */}
                <g transform="translate(160, 240)">
                  <polygon points="10,20 30,10 40,25 20,35" fill="#00e1b5" opacity="0.4" />
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
                  <path d="M -10,100 C -40,110 -60,90 -90,120" stroke="#00e1b5" strokeWidth="2" strokeDasharray="4,4" />
                </g>

                <defs>
                  <linearGradient id="device-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#0a2c42" />
                    <stop offset="100%" stopColor="#1e293b" />
                  </linearGradient>
                  <linearGradient id="chart-grad-green" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#00e1b5" />
                    <stop offset="100%" stopColor="#004d40" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

          </main>

          {/* Footer of Login Screen */}
          <footer className="relative z-10 px-6 py-6 sm:px-12 border-t border-slate-200/50 bg-white/40 flex flex-col md:flex-row justify-between items-center gap-4 text-[12px] font-medium text-[#44474a]">
            <div>
              <p>© 2024 Nexus Finance Institutional Group. All rights reserved.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-slate-900 transition">Privacy Policy</a>
              <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-slate-900 transition">Terms of Service</a>
              <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-slate-900 transition">Regulatory Disclosure</a>
              <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-slate-900 transition">Cookie Settings</a>
              <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-slate-900 transition">Security</a>
            </div>
          </footer>
        </>
      )}

      {/* VIEW: REGISTER / CREATE ACCOUNT */}
      {view === 'register' && (
        <>
          {/* Header */}
          <header className="relative z-10 px-6 py-5 sm:px-12 flex justify-between items-center bg-transparent">
            <div className="flex items-center gap-2">
              <span className="font-sans text-[20px] tracking-tight flex items-center">
                <span className="text-[#0E171C] font-black">Nexus</span>
                <span className="text-[#0E171C] font-light">Finance</span>
              </span>
            </div>
            <div className="flex items-center gap-4 text-[#44474a]">
              <Globe className="w-5 h-5 cursor-pointer hover:text-[#0e171c]" />
              <HelpCircle className="w-5 h-5 cursor-pointer hover:text-[#0e171c]" />
            </div>
          </header>

          {/* Main Container */}
          <main className="relative z-10 flex-grow flex flex-col justify-center items-center px-4 py-8">
            <h2 className="text-[32px] sm:text-[36px] font-bold text-[#0E171C] mb-8 text-center tracking-tight">
              Create your account
            </h2>

            {/* Custom Create account white frame card */}
            <div className="bg-white/80 backdrop-blur-md rounded-[32px] shadow-xl shadow-teal-900/5 border border-white/60 p-8 sm:p-10 w-full max-w-lg animate-in fade-in zoom-in-95 duration-300">
              <form onSubmit={handleRegisterSubmit} className="space-y-6">
                
                {/* Field: Full Name */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4.5 h-4.5" />
                    </div>
                    <input
                      type="text"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      placeholder="Johnathan Doe"
                      className="w-full bg-[#f1f4f6]/80 border-0 focus:bg-white focus:ring-2 focus:ring-[#00e1b5]/20 focus:outline-[#00e1b5]/40 rounded-2xl pl-12 pr-6 py-3.5 text-[14px] text-slate-800 font-medium transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Field: Email Address */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                      <span className="text-[17px] font-light leading-none select-none">@</span>
                    </div>
                    <input
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="j.doe@nexus.finance"
                      className="w-full bg-[#f1f4f6]/80 border-0 focus:bg-white focus:ring-2 focus:ring-[#00e1b5]/20 focus:outline-[#00e1b5]/40 rounded-2xl pl-12 pr-6 py-3.5 text-[14px] text-slate-800 font-medium transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Field: Password */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4.5 h-4.5" />
                    </div>
                    <input
                      type="password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-[#f1f4f6]/80 border-0 focus:bg-white focus:ring-2 focus:ring-[#00e1b5]/20 focus:outline-[#00e1b5]/40 rounded-2xl pl-12 pr-6 py-3.5 text-[14px] text-slate-800 font-mono transition-all animate-none"
                      required
                    />
                  </div>

                  {/* Field: Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4.5 h-4.5" />
                      </div>
                      <input
                        type="password"
                        value={registerConfirmPassword}
                        onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-[#f1f4f6]/80 border-0 focus:bg-white focus:ring-2 focus:ring-[#00e1b5]/20 focus:outline-[#00e1b5]/40 rounded-2xl pl-12 pr-6 py-3.5 text-[14px] text-slate-800 font-mono transition-all animate-none"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Field: Phone Number */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4.5 h-4.5" />
                    </div>
                    <input
                      type="tel"
                      value={registerPhone}
                      onChange={(e) => setRegisterPhone(e.target.value)}
                      placeholder="+855 12 345 678"
                      className="w-full bg-[#f1f4f6]/80 border-0 focus:bg-white focus:ring-2 focus:ring-[#00e1b5]/20 focus:outline-[#00e1b5]/40 rounded-2xl pl-12 pr-6 py-3.5 text-[14px] text-slate-800 font-medium transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Button Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={registerLoading}
                    className="w-full bg-[#00e1b5] hover:bg-[#00f2c4] text-[#0e171c] font-bold text-[15.5px] py-4 rounded-2xl flex items-center justify-center gap-1.5 transition active:scale-98 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
              <div className="text-center mt-6 text-[13.5px] font-semibold text-slate-600">
                <span>Already have an account? </span>
                <button 
                  onClick={() => setView('login')}
                  className="text-[#0e171c] hover:text-teal-700 cursor-pointer font-bold ml-0.5"
                >
                  Log In
                </button>
              </div>

            </div>
          </main>

          {/* Footer of Create Account page */}
          <footer className="relative z-10 px-6 py-6 sm:px-12 border-t border-slate-200/50 bg-white/40 flex flex-col md:flex-row justify-between items-center gap-4 text-[12px] font-semibold tracking-wide text-[#44474a]">
            <div>
              <p>© 2026 NEXUS FINANCE. PRECISE INTELLIGENCE.</p>
            </div>
            <div className="flex gap-6">
              <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-slate-900 transition">Privacy Policy</a>
              <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-slate-900 transition">Terms of Service</a>
              <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-slate-900 transition">Security</a>
            </div>
          </footer>
        </>
      )}

      {/* VIEW: VERIFY (6-digit OTP) */}
      {view === 'verify' && (
        <div className="min-h-screen flex flex-col justify-between w-full h-full">
          <div className="flex-grow flex flex-col justify-center items-center px-4 py-8">
            
            {/* Card form */}
            <div className="bg-white/90 backdrop-blur-md rounded-[32px] border border-white/80 p-8 sm:p-12 w-full max-w-lg shadow-xl shadow-teal-900/5 flex flex-col items-center animate-in zoom-in-95 duration-200">
              
              {/* Icon */}
              <div className="relative w-16 h-16 bg-[#f1f4f6]/80 rounded-full flex items-center justify-center text-slate-700 border border-slate-200/10 mb-6">
                {verifyVia === 'email' ? <Mail className="w-7 h-7" /> : <Phone className="w-7 h-7" />}
                <div className="absolute top-4 right-4 w-3.5 h-3.5 bg-slate-800 rounded-full border-2 border-white" />
              </div>

              {/* Method toggle */}
              <div className="flex gap-2 mb-6 bg-[#f1f4f6] rounded-xl p-1">
                <button
                  onClick={() => { setVerifyVia('phone'); setCode(Array(6).fill('')); }}
                  className={`px-4 py-2 rounded-lg text-[12px] font-bold transition cursor-pointer ${verifyVia === 'phone' ? 'bg-white shadow-sm text-[#0E171C]' : 'text-slate-500 hover:text-[#0E171C]'}`}
                >
                  <Phone className="w-3.5 h-3.5 inline mr-1.5" />Phone
                </button>
                <button
                  onClick={() => { setVerifyVia('email'); setCode(Array(6).fill('')); }}
                  className={`px-4 py-2 rounded-lg text-[12px] font-bold transition cursor-pointer ${verifyVia === 'email' ? 'bg-white shadow-sm text-[#0E171C]' : 'text-slate-500 hover:text-[#0E171C]'}`}
                >
                  <Mail className="w-3.5 h-3.5 inline mr-1.5" />Email
                </button>
              </div>

              {/* Head */}
              <h2 className="text-[28px] sm:text-[32px] font-bold text-[#0E171C] text-center tracking-tight">
                Verify Your {verifyVia === 'email' ? 'Email' : 'Phone'}
              </h2>
              <p className="text-[13px] text-slate-500 font-medium text-center mt-3 mb-8 max-w-sm leading-relaxed">
                We've sent a 6-digit code to <strong>{verifyVia === 'email' ? registerEmail : registerPhone}</strong>. Enter it below.
              </p>

              <form onSubmit={handleVerifySubmit} className="w-full space-y-8 flex flex-col items-center">
                
                {/* 6 code inputs row layout */}
                <div className="flex gap-2 sm:gap-3.5 justify-center">
                  {code.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-11 h-11 sm:w-14 sm:h-14 bg-white/90 border border-slate-200/90 rounded-2xl text-center text-[18px] sm:text-[22px] font-sans font-extrabold focus:outline-none focus:border-[#00e1b5] focus:ring-4 focus:ring-[#00e1b5]/10 text-slate-800 transition-all shadow-xs"
                      required
                    />
                  ))}
                </div>

                {/* Large Button submit verification */}
                <button
                  type="submit"
                  disabled={vSuccess || verifyLoading}
                  className="w-full bg-[#00e1b5] hover:bg-[#00f2c4] text-[#0e171c] font-bold py-4 rounded-2xl flex items-center justify-center gap-1.5 transition active:scale-98 shadow-md hover:shadow-lg text-[15px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {vSuccess ? (
                    <span className="flex items-center gap-2 text-slate-800">
                      <CheckCircle2 className="w-5 h-5 text-teal-800 animate-bounce" /> Verified! Loading nodes...
                    </span>
                  ) : verifyLoading ? (
                    <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> VERIFYING...</span>
                  ) : (
                    <>
                      VERIFY CODE <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </form>

              {/* Utility action links */}
              <div className="w-full flex justify-between items-center text-[13px] font-bold text-slate-500 mt-8 pt-6 border-t border-slate-100 select-none">
                <button 
                  type="button"
                  onClick={() => {
                    setCode(Array(6).fill(''));
                    inputRefs.current[0]?.focus();
                    const body = verifyVia === 'email'
                      ? { via: 'email', email: registerEmail }
                      : { via: 'phone', phone: registerPhone };
                    fetch(`${API}/auth/send-otp`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(body),
                    }).catch(() => {});
                  }}
                  className="flex items-center gap-2 hover:text-[#0e171c] cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" /> Resend Code
                </button>

                <button 
                  type="button" 
                  onClick={() => setView('register')}
                  className="hover:text-[#0e171c] cursor-pointer"
                >
                  Back
                </button>
              </div>

            </div>

          </div>

          {/* Footer inside view-verify */}
          <footer className="relative z-10 px-6 py-6 sm:px-12 bg-transparent flex justify-center text-[11.5px] font-semibold text-[#44474a]/60">
            <p>© 2026 NEXUS FINANCE. ALL INTEGRITY SERVED.</p>
          </footer>
        </div>
      )}

      {view === 'forgot' && (
        <div className="min-h-screen flex flex-col justify-between w-full h-full">
          <div className="flex-grow flex flex-col justify-center items-center px-4 py-8">
            <div className="bg-white/90 backdrop-blur-md rounded-[32px] border border-white/80 p-8 sm:p-12 w-full max-w-lg shadow-xl shadow-teal-900/5 flex flex-col items-center animate-in zoom-in-95 duration-200">

              <div className="relative w-16 h-16 bg-[#f1f4f6]/80 rounded-full flex items-center justify-center text-slate-700 border border-slate-200/10 mb-6">
                <Lock className="w-7 h-7" />
              </div>

              <h2 className="text-[28px] sm:text-[32px] font-bold text-[#0E171C] text-center tracking-tight">
                Reset Password
              </h2>
              <p className="text-[13px] text-slate-500 font-medium text-center mt-3 mb-8 max-w-sm leading-relaxed">
                {forgotSent
                  ? 'If an account exists with that email, we\'ve sent a password reset link.'
                  : 'Enter your email and we\'ll send you a password reset link.'}
              </p>

              {!forgotSent ? (
                <form onSubmit={handleForgotSubmit} className="w-full space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[11.5px] font-bold text-slate-500 uppercase tracking-wider ml-1">Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <Lock className="w-4 h-4 text-slate-400" />
                      </div>
                      <input
                        type="email"
                        placeholder="your@email.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3.5 bg-white/90 border border-slate-200/90 rounded-2xl text-[14px] font-medium focus:outline-none focus:border-[#00e1b5] focus:ring-4 focus:ring-[#00e1b5]/10 text-slate-800 transition-all"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#00e1b5] hover:bg-[#00f2c4] text-[#0e171c] font-bold py-4 rounded-2xl flex items-center justify-center gap-1.5 transition active:scale-98 shadow-md hover:shadow-lg text-[15px] cursor-pointer"
                  >
                    SEND RESET LINK <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setView('login')}
                  className="w-full bg-[#00e1b5] hover:bg-[#00f2c4] text-[#0e171c] font-bold py-4 rounded-2xl transition active:scale-98 shadow-md hover:shadow-lg text-[15px] cursor-pointer"
                >
                  BACK TO LOGIN
                </button>
              )}

              <div className="w-full flex justify-between items-center text-[13px] font-bold text-slate-500 mt-8 pt-6 border-t border-slate-100 select-none">
                <button onClick={() => setView('login')} className="hover:text-[#0e171c] cursor-pointer">
                  ← Back to Login
                </button>
                <button onClick={() => setView('register')} className="hover:text-[#0e171c] cursor-pointer">
                  Create Account
                </button>
              </div>
            </div>
          </div>
          <footer className="relative z-10 px-6 py-6 sm:px-12 bg-transparent flex justify-center text-[11.5px] font-semibold text-[#44474a]/60">
            <p>© 2026 NEXUS FINANCE. ALL INTEGRITY SERVED.</p>
          </footer>
        </div>
      )}

    </div>
  );
}
