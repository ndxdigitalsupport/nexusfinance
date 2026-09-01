import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Lock, 
  User, 
  Phone, 
  HelpCircle, 
  RefreshCw,
  Eye,
  EyeOff,
  Zap,
  CheckCircle2,
  Sparkles,
  FileText,
  Send,
  Shield,
  Clock,
  Check,
  QrCode
} from 'lucide-react';
import { showToast } from './Toast';
import { API } from '../api';
import { useCurrency } from '../context/CurrencyContext';

interface AuthPageProps {
  onLoginSuccess: (token: string) => void;
}

type AuthView = 'login' | 'register' | 'forgot';

export default function AuthPage({ onLoginSuccess }: AuthPageProps) {
  const { language, setLanguage, isKhmer } = useCurrency();
  const [view, setView] = useState<AuthView>('login');
  const [emailVerificationRequired, setEmailVerificationRequired] = useState<boolean | null>(null);

  useEffect(() => {
    fetch(`${API}/diag`)
      .then(res => res.json())
      .then(data => {
        if (data && data.configRecord) {
          setEmailVerificationRequired(data.configRecord.emailVerificationRequired !== false);
        } else {
          setEmailVerificationRequired(true);
        }
      })
      .catch(err => {
        console.error('Failed to load email verification config:', err);
        setEmailVerificationRequired(true);
      });
  }, []);
  
  // Login states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Login → unverified email states
  const [loginVerifyEmail, setLoginVerifyEmail] = useState('');
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [loginOtpCode, setLoginOtpCode] = useState('');
  const [loginOtpTimer, setLoginOtpTimer] = useState(0);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');

  // Register states
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');

  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);

  // Loading states
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  // Register OTP states
  const [registerOtpSent, setRegisterOtpSent] = useState(false);
  const [registerOtpCode, setRegisterOtpCode] = useState('');
  const [registerOtpTimer, setRegisterOtpTimer] = useState(0);

  // Telegram/SMS verification states
  const [verifyMethod, setVerifyMethod] = useState<'email' | 'telegram' | 'sms'>('email');
  const [registeredUserId, setRegisteredUserId] = useState<number | null>(null);
  const [telegramLinked, setTelegramLinked] = useState<boolean | null>(null);
  const [tgOtpSent, setTgOtpSent] = useState(false);
  const [tgOtpCode, setTgOtpCode] = useState('');
  const [tgOtpTimer, setTgOtpTimer] = useState(0);
  const [tgSessionId, setTgSessionId] = useState('');
  const [tgCheckLoading, setTgCheckLoading] = useState(false);

  // Forgot / reset states
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [forgotOtpCode, setForgotOtpCode] = useState('');
  const [forgotOtpTimer, setForgotOtpTimer] = useState(0);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');

  // Login handler — email + password
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return showToast('Enter phone/email and password', 'error');
    setLoginLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === 'EMAIL_NOT_VERIFIED') {
          setLoginVerifyEmail(loginEmail);
          await sendLoginVerifyOtp(loginEmail);
          showToast(loginEmail.includes('@nexus.local') ? 'Account not verified — a code was sent via Telegram & SMS.' : 'Email not verified — a code was sent to your email.', 'info');
          return;
        }
        throw new Error(data.error || 'Invalid phone/email or password.');
      }
      onLoginSuccess(data.token);
    } catch (err: any) {
      showToast(err?.message || 'Invalid phone/email or password.', 'error');
    } finally {
      setLoginLoading(false);
    }
  };

  // Send OTP for the login verification step
  const sendLoginVerifyOtp = async (emailOrPhone: string) => {
    try {
      const isPhoneOnly = emailOrPhone.includes('@nexus.local');
      const endpoint = isPhoneOnly ? `${API}/auth/send-otp-phone` : `${API}/auth/send-otp`;
      const body = isPhoneOnly
        ? { phone: emailOrPhone.replace('@nexus.local', '') }
        : { email: emailOrPhone };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send the verification code.');
      setLoginOtpSent(true);
      setLoginOtpTimer(300);
      const interval = setInterval(() => {
        setLoginOtpTimer(prev => { if (prev <= 1) clearInterval(interval); return prev - 1; });
      }, 1000);
    } catch (err: any) {
      showToast(err?.message || 'Failed to send the verification code.', 'error');
    }
  };

  const handleVerifyLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginOtpCode || loginOtpCode.length < 6) return showToast('Enter the 6-digit code', 'error');
    setLoginLoading(true);
    try {
      const isPhoneOnly = loginVerifyEmail.includes('@nexus.local');
      const endpoint = isPhoneOnly ? `${API}/auth/verify-otp-phone` : `${API}/auth/verify-otp`;
      const body = isPhoneOnly
        ? { phone: loginVerifyEmail.replace('@nexus.local', ''), code: loginOtpCode }
        : { email: loginVerifyEmail, code: loginOtpCode };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid or expired code.');
      setLoginVerifyEmail('');
      setLoginOtpSent(false);
      setLoginOtpCode('');
      showToast('Verified! Login to continue.', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Invalid or expired code.', 'error');
    } finally {
      setLoginLoading(false);
    }
  };

  // Helper to send SMS OTP code during registration
  const sendRegisterSmsOtp = async (phoneVal: string) => {
    try {
      const res = await fetch(`${API}/auth/send-otp-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneVal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send SMS OTP.');
      setRegisterOtpTimer(300);
      const interval = setInterval(() => {
        setRegisterOtpTimer(prev => { if (prev <= 1) clearInterval(interval); return prev - 1; });
      }, 1000);
      showToast('OTP code sent to your phone via SMS!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to send SMS OTP.', 'error');
    }
  };

  // Register handler — creates user then sends OTP
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerPassword !== registerConfirmPassword) return showToast('Passwords do not match', 'error');
    if (!emailVerificationRequired && !registerPhone) {
      return showToast('Phone number is required.', 'error');
    }
    setRegisterLoading(true);
    try {
      const targetEmail = emailVerificationRequired 
        ? registerEmail 
        : `${registerPhone.replace(/\D/g, '')}@nexus.local`;
      const targetPhone = registerPhone;
      
      const registerRes = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: registerName, email: targetEmail, password: registerPassword, phone: targetPhone }),
      });
      const registerData = await registerRes.json();
      if (!registerRes.ok) throw new Error(registerData.error || 'Registration failed.');

      if (emailVerificationRequired) {
        const otpRes = await fetch(`${API}/auth/send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: targetEmail }),
        });
        const otpData = await otpRes.json();
        if (!otpRes.ok) throw new Error(otpData.error || 'Failed to send the verification code.');

        setRegisterOtpSent(true);
        setRegisterOtpTimer(300);
        const interval = setInterval(() => {
          setRegisterOtpTimer(prev => { if (prev <= 1) clearInterval(interval); return prev - 1; });
        }, 1000);
        showToast('OTP sent to your email!', 'success');
      } else {
        if (registerData.user && registerData.user.id) {
          setRegisteredUserId(registerData.user.id);
        }
        setRegisterOtpSent(true);
        setVerifyMethod('sms');
        await sendRegisterSmsOtp(targetPhone);
      }
    } catch (err: any) {
      showToast(err?.message || 'Registration failed.', 'error');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleVerifyRegisterOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerOtpCode || registerOtpCode.length < 6) return showToast('Enter the 6-digit code', 'error');
    setRegisterLoading(true);
    try {
      const isSms = verifyMethod === 'sms';
      const endpoint = isSms ? `${API}/auth/verify-otp-phone` : `${API}/auth/verify-otp`;
      
      const targetUserEmail = emailVerificationRequired 
        ? registerEmail 
        : `${registerPhone.replace(/\D/g, '')}@nexus.local`;

      const body = isSms
        ? { phone: registerPhone, code: registerOtpCode }
        : { email: targetUserEmail, code: registerOtpCode };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Wrong code. Try again.');
      setView('login');
      showToast('Account created! Login with your phone/email and password.', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Wrong code. Try again.', 'error');
      setRegisterOtpCode('');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleResendRegisterOtp = async () => {
    setRegisterLoading(true);
    try {
      const isSms = verifyMethod === 'sms';
      const endpoint = isSms ? `${API}/auth/send-otp-phone` : `${API}/auth/send-otp`;
      
      const targetUserEmail = emailVerificationRequired 
        ? registerEmail 
        : `${registerPhone.replace(/\D/g, '')}@nexus.local`;

      const body = isSms
        ? { phone: registerPhone }
        : { email: targetUserEmail };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resend OTP.');
      setRegisterOtpTimer(300);
      showToast('New OTP sent!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to resend OTP.', 'error');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleTabChange = (method: 'email' | 'telegram' | 'sms') => {
    setVerifyMethod(method);
    if (method === 'telegram') {
      checkTelegramLink(true);
    } else if (method === 'sms') {
      sendRegisterSmsOtp(registerPhone);
    }
  };

  const checkTelegramLink = async (silent = false) => {
    if (!silent) setTgCheckLoading(true);
    try {
      const res = await fetch(`${API}/auth/check-link?phone=${encodeURIComponent(registerPhone)}`);
      const data = await res.json();
      setTelegramLinked(!!data.linked);
      if (data.linked && !silent) {
        showToast('Telegram account linked successfully!', 'success');
      } else if (!data.linked && !silent) {
        showToast('Telegram account not linked yet. Please open the bot first.', 'warning');
      }
    } catch (e) {
      console.error('Failed to check Telegram link:', e);
    } finally {
      if (!silent) setTgCheckLoading(false);
    }
  };

  const handleSendTgOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setRegisterLoading(true);
    try {
      const res = await fetch(`${API}/v1/auth/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: registerPhone, channel: 'telegram' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send Telegram OTP.');
      
      setTgSessionId(data.data.session_id);
      setTgOtpSent(true);
      setTgOtpTimer(300);
      const interval = setInterval(() => {
        setTgOtpTimer(prev => { if (prev <= 1) clearInterval(interval); return prev - 1; });
      }, 1000);
      showToast('OTP sent to your Telegram!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to send Telegram OTP.', 'error');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleVerifyTgOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tgOtpCode || tgOtpCode.length < 6) return showToast('Enter the 6-digit code', 'error');
    setRegisterLoading(true);
    try {
      const res = await fetch(`${API}/v1/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: registerPhone, session_id: tgSessionId, code: tgOtpCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid or expired OTP.');
      
      showToast('Phone number verified successfully!', 'success');
      onLoginSuccess(data.data.auth_token);
    } catch (err: any) {
      showToast(err?.message || 'Invalid or expired OTP.', 'error');
      setTgOtpCode('');
    } finally {
      setRegisterLoading(false);
    }
  };

  // Forgot password OTP handlers
  const handleSendForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = forgotEmail;
    if (!input) return showToast('Enter your email or phone number', 'error');
    setForgotLoading(true);
    try {
      const isPhone = !input.includes('@');
      const endpoint = isPhone ? `${API}/auth/forgot-password-phone` : `${API}/auth/send-otp`;
      const body = isPhone ? { phone: input } : { email: input };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP.');
      setForgotOtpSent(true);
      setForgotOtpTimer(300);
      const interval = setInterval(() => {
        setForgotOtpTimer(prev => { if (prev <= 1) clearInterval(interval); return prev - 1; });
      }, 1000);
      showToast('Verification code sent!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to send OTP.', 'error');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotOtpCode || forgotOtpCode.length < 6) return showToast('Enter the 6-digit code', 'error');
    setForgotLoading(true);
    try {
      const input = forgotEmail;
      const isPhone = !input.includes('@');
      const endpoint = isPhone ? `${API}/auth/verify-otp-phone` : `${API}/auth/verify-otp`;
      const body = isPhone
        ? { phone: input, code: forgotOtpCode }
        : { email: input, code: forgotOtpCode };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid or expired code.');
      setShowResetForm(true);
    } catch (err: any) {
      showToast(err?.message || 'Invalid or expired code.', 'error');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPassword || resetPassword.length < 6) return showToast('Password must be at least 6 characters', 'error');
    if (resetPassword !== resetConfirmPassword) return showToast('Passwords do not match', 'error');
    setForgotLoading(true);
    try {
      const input = forgotEmail;
      const isPhone = !input.includes('@');
      const body = isPhone
        ? { phone: input, newPassword: resetPassword }
        : { email: input, newPassword: resetPassword };
      const res = await fetch(`${API}/auth/update-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed to reset password.'); }
      showToast('Password reset! Login with your new password.', 'success');
      setShowResetForm(false);
      setForgotOtpSent(false);
      setForgotOtpCode('');
      setResetPassword('');
      setResetConfirmPassword('');
      setView('login');
    } catch (err: any) {
      showToast(err?.message || 'Failed to reset password.', 'error');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResendForgotOtp = async () => {
    setForgotLoading(true);
    try {
      const input = forgotEmail;
      const isPhone = !input.includes('@');
      const endpoint = isPhone ? `${API}/auth/forgot-password-phone` : `${API}/auth/send-otp`;
      const body = isPhone ? { phone: input } : { email: input };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resend OTP.');
      setForgotOtpTimer(300);
      showToast('New OTP sent!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to resend OTP.', 'error');
    } finally {
      setForgotLoading(false);
    }
  };

  if (emailVerificationRequired === null) {
    return (
      <div className="h-screen w-full relative bg-[#f8fcfa] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen w-full relative bg-gradient-to-br from-[#f8fcfa] via-[#eef8f5] to-[#f0f6ff] text-slate-800 font-sans select-none overflow-hidden flex flex-col">
      {/* Dynamic Keyframes & Shimmer Styles */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(0.6deg); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(11px) rotate(-0.8deg); }
        }
        @keyframes float-subtle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.65; transform: scale(1.08); }
        }
        @keyframes aurora-spin {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.1); }
          100% { transform: rotate(360deg) scale(1); }
        }
        @keyframes shimmer-sweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .anim-float-1 { animation: float-slow 6s ease-in-out infinite; }
        .anim-float-2 { animation: float-reverse 7s ease-in-out infinite 1s; }
        .anim-float-3 { animation: float-subtle 5.5s ease-in-out infinite 0.5s; }
        .anim-glow { animation: pulse-glow 8s ease-in-out infinite; }
        .anim-aurora { animation: aurora-spin 25s linear infinite; }
        .shimmer-btn:hover .shimmer-layer { animation: shimmer-sweep 1.2s ease-in-out infinite; }
        
        .dot-matrix-light {
          background-image: radial-gradient(rgba(15, 23, 42, 0.05) 1.2px, transparent 1.2px);
          background-size: 26px 26px;
        }
      `}</style>

      {/* 1. Ambient Background Layer with Animated Glowing Pastel Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-transparent">
        {/* Dot matrix overlay */}
        <div className="absolute inset-0 dot-matrix-light opacity-80 pointer-events-none" />

        {/* Ambient Pastel Mesh Orbs */}
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-emerald-400/20 blur-[130px] anim-aurora pointer-events-none" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[650px] h-[650px] rounded-full bg-cyan-400/20 blur-[140px] anim-aurora pointer-events-none" style={{ animationDuration: '30s', animationDirection: 'reverse' }} />
        <div className="absolute top-[35%] left-[30%] w-[450px] h-[450px] rounded-full bg-teal-300/20 blur-[120px] anim-glow pointer-events-none" />
        <div className="absolute top-[65%] left-[10%] w-[350px] h-[350px] rounded-full bg-indigo-300/15 blur-[100px] pointer-events-none" />
      </div>

      {/* 2. Scrollable Viewport Container */}
      <div className="absolute inset-0 overflow-y-auto w-full h-full flex flex-col z-10">
        
        {/* Global Navigation Header */}
        <header className="relative z-20 px-6 py-4 sm:px-12 flex justify-between items-center bg-white/50 backdrop-blur-md border-b border-slate-200/70 shadow-xs">
          {/* Logo Mark */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md shadow-emerald-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <span className="text-emerald-600 font-black text-xl tracking-tighter">N</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-sans text-[20px] tracking-tight flex items-center leading-none">
                <span className="text-slate-900 font-extrabold">Nexus</span>
                <span className="text-emerald-600 font-medium ml-0.5">Finance</span>
              </span>
              <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase mt-1">All-in-One FinTech Ecosystem</span>
            </div>
          </div>

          {/* Right Header Badges & Language Switcher */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* System Status Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-[12px] font-bold shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Systems Online</span>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center bg-white/90 border border-slate-200 rounded-xl p-1 shadow-xs">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-lg text-[11.5px] font-bold transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('kh')}
                className={`px-3 py-1 rounded-lg text-[11.5px] font-bold transition-all cursor-pointer ${
                  language === 'kh'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                KH
              </button>
            </div>

            {/* Help / Support Link */}
            <a 
              href="mailto:support@nexusfinance.com" 
              className="hidden md:flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-semibold text-[13px] transition px-3 py-1.5 rounded-xl hover:bg-slate-100/70"
            >
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span>{isKhmer ? 'ជំនួយ' : 'Support'}</span>
            </a>
          </div>
        </header>

        {/* 3. Main Split Hero & Auth Card Section */}
        <main className="relative z-10 flex-grow flex items-center justify-center px-4 sm:px-8 lg:px-12 py-8 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center w-full">

            {/* ========================================================================= */}
            {/* LEFT COLUMN: Clean Brand Hero & Animated Floating 3D Feature Cards */}
            {/* ========================================================================= */}
            <div className="lg:col-span-6 hidden lg:flex flex-col justify-center space-y-7 pr-2">
              
              {/* Badge & Headline */}
              <div className="space-y-3.5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-[12px] font-bold tracking-wide shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isKhmer ? 'ប្រព័ន្ធអេកូឡូស៊ីហិរញ្ញវត្ថុជំនាន់ថ្មី' : 'NEXT-GEN FINTECH ECOSYSTEM'}</span>
                </div>

                <h1 className="text-[38px] xl:text-[44px] font-black text-slate-900 tracking-tight leading-[1.15]">
                  {isKhmer ? (
                    <>
                      ការផ្តល់ឥណទាន <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
                        លឿន រហ័ស និងមានសុវត្ថិភាពខ្ពស់
                      </span>
                    </>
                  ) : (
                    <>
                      Smarter Lending. <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
                        Instant Approvals & Contracts.
                      </span>
                    </>
                  )}
                </h1>

                <p className="text-slate-600 text-[15px] leading-relaxed max-w-lg font-medium">
                  {isKhmer 
                    ? 'គ្រប់គ្រងឥណទាន បង្កើតកិច្ចសន្យាខ្មែរស្របច្បាប់ និងភ្ជាប់ទំនាក់ទំនងជាមួយ Telegram & SMS ស្វ័យប្រវត្ត។'
                    : 'Automated underwriting, instant KHQR payouts, real-time Telegram alerts, and print-ready legal Khmer contracts.'}
                </p>
              </div>

              {/* 3 Animated Floating 3D Light Glass Cards */}
              <div className="relative h-[250px] w-full max-w-lg select-none">
                
                {/* Floating Card 1: Instant Auto-Underwriting & KHQR */}
                <div className="absolute top-0 left-0 w-[275px] bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-4 shadow-xl shadow-slate-200/60 anim-float-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-slate-900 flex items-center gap-1.5">
                        <span>Auto-Underwriting</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <div className="text-[11.5px] text-emerald-600 font-bold">$500 Disbursed in 45s</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2.5 border-t border-slate-100 font-medium">
                    <span>Credit Score: 780</span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">Approved</span>
                  </div>
                </div>

                {/* Floating Card 2: Telegram & SMS Broadcasting Bot */}
                <div className="absolute top-14 right-2 w-[265px] bg-white/95 backdrop-blur-xl border border-cyan-200 rounded-2xl p-4 shadow-xl shadow-cyan-900/5 anim-float-2 z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 shrink-0">
                      <Send className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-slate-900">Telegram & SMS Bot</div>
                      <div className="text-[11px] text-cyan-700 font-semibold">1-Trip OTP & Live Alerts</div>
                    </div>
                  </div>
                  <div className="mt-2.5 bg-slate-50 rounded-lg p-2 text-[11px] text-slate-700 flex items-center gap-2 border border-slate-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
                    <span className="font-medium">Next installment: Sep 27</span>
                  </div>
                </div>

                {/* Floating Card 3: Khmer Legal Contracts Engine */}
                <div className="absolute bottom-0 left-10 w-[285px] bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-3.5 shadow-xl shadow-slate-200/60 anim-float-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
                      <FileText className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[12.5px] font-bold text-slate-900">Khmer Legal Contracts</div>
                      <div className="text-[10.5px] text-indigo-600 font-medium">A4 Print Ready • 5 Pages</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold">PDF/Print</span>
                  </div>
                </div>

              </div>

              {/* Trust Metric Strip */}
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-200/70 max-w-lg">
                <div className="bg-white/80 rounded-2xl p-3.5 border border-slate-200/80 shadow-xs">
                  <div className="text-[18px] font-black text-emerald-600">$4.8M+</div>
                  <div className="text-[11px] text-slate-500 font-semibold">{isKhmer ? 'ប្រាក់បានបើកផ្តល់' : 'Disbursed'}</div>
                </div>
                <div className="bg-white/80 rounded-2xl p-3.5 border border-slate-200/80 shadow-xs">
                  <div className="text-[18px] font-black text-cyan-600">12,500+</div>
                  <div className="text-[11px] text-slate-500 font-semibold">{isKhmer ? 'អតិថិជនសកម្ម' : 'Active Borrowers'}</div>
                </div>
                <div className="bg-white/80 rounded-2xl p-3.5 border border-slate-200/80 shadow-xs">
                  <div className="text-[18px] font-black text-indigo-600">256-Bit</div>
                  <div className="text-[11px] text-slate-500 font-semibold">{isKhmer ? 'សុវត្ថិភាពធនាគារ' : 'Bank SSL'}</div>
                </div>
              </div>

            </div>

            {/* ========================================================================= */}
            {/* RIGHT COLUMN: Modern Crisp Light Glassmorphic Auth Form Card */}
            {/* ========================================================================= */}
            <div className="lg:col-span-6 flex justify-center lg:justify-end w-full">
              <div className="w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-[32px] p-8 sm:p-10 border border-slate-200/90 shadow-2xl shadow-slate-300/50 relative z-10 transition-all">
                
                {/* View Switcher Tabs (Login vs Register) */}
                {view !== 'forgot' && !loginVerifyEmail && !registerOtpSent && (
                  <div className="flex bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/70 mb-8">
                    <button
                      type="button"
                      onClick={() => setView('login')}
                      className={`flex-1 py-2.5 rounded-xl text-[13.5px] font-bold transition-all cursor-pointer text-center ${
                        view === 'login'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {isKhmer ? 'ចូលប្រើប្រាស់' : 'Sign In'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setView('register')}
                      className={`flex-1 py-2.5 rounded-xl text-[13.5px] font-bold transition-all cursor-pointer text-center ${
                        view === 'register'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {isKhmer ? 'បង្កើតគណនី' : 'Create Account'}
                    </button>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* VIEW A: LOGIN FORM */}
                {/* ------------------------------------------------------------- */}
                {view === 'login' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    
                    {/* Header Text */}
                    <div className="text-left mb-6">
                      <h2 className="text-[26px] font-black text-slate-900 tracking-tight">
                        {loginVerifyEmail 
                          ? (isKhmer ? 'ផ្ទៀងផ្ទាត់គណនី' : 'Verify Your Account') 
                          : (isKhmer ? 'ស្វាគមន៍ការចូលប្រើ' : 'Welcome Back')}
                      </h2>
                      <p className="text-[13.5px] text-slate-500 font-medium mt-1">
                        {loginVerifyEmail 
                          ? (isKhmer ? 'សូមបញ្ចូលលេខកូដសម្ងាត់ ៦ ខ្ទង់' : 'Enter the 6-digit code sent to verify') 
                          : (isKhmer ? 'បញ្ចូលព័ត៌មានគណនីរបស់អ្នកដើម្បីចូលទៅកាន់ផ្ទាំងគ្រប់គ្រង' : 'Access your loans, ledger, and repayments')}
                      </p>
                    </div>

                    {loginVerifyEmail ? (
                      /* Unverified Account OTP Step */
                      <form onSubmit={handleVerifyLoginOtp} className="space-y-5">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                          <p className="text-[12.5px] text-slate-600 font-medium">
                            Code sent to <strong className="text-emerald-700">{loginVerifyEmail.includes('@nexus.local') ? loginVerifyEmail.replace('@nexus.local', '') : loginVerifyEmail}</strong>
                          </p>
                        </div>
                        <div>
                          <input
                            type="text"
                            maxLength={6}
                            value={loginOtpCode}
                            onChange={(e) => setLoginOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="000000"
                            className="w-full text-center text-[28px] tracking-[10px] font-mono rounded-2xl bg-slate-50 border border-slate-200 px-6 py-4 text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-inner font-bold"
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={loginLoading || loginOtpCode.length < 6}
                          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-[15px] py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                        >
                          {loginLoading ? (
                            <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> VERIFYING...</span>
                          ) : (
                            <>{isKhmer ? 'ផ្ទៀងផ្ទាត់ឥឡូវនេះ' : 'VERIFY CODE'} <ArrowRight className="w-5 h-5 stroke-[2.5]" /></>
                          )}
                        </button>
                        <div className="flex justify-between items-center text-[12.5px] pt-1">
                          <button type="button" onClick={() => sendLoginVerifyOtp(loginVerifyEmail)} disabled={loginOtpTimer > 0}
                            className="text-slate-500 hover:text-emerald-600 cursor-pointer disabled:opacity-40 font-semibold"
                          >
                            Resend code {loginOtpTimer > 0 && `(${Math.floor(loginOtpTimer / 60)}:${String(loginOtpTimer % 60).padStart(2, '0')})`}
                          </button>
                          <button type="button" onClick={() => { setLoginVerifyEmail(''); setLoginOtpCode(''); }}
                            className="text-slate-500 hover:text-slate-900 cursor-pointer font-medium"
                          >
                            Back to login
                          </button>
                        </div>
                      </form>
                    ) : (
                      /* Main Login Form */
                      <form onSubmit={handleLoginSubmit} className="space-y-4">
                        
                        {/* Phone / Email Field */}
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-extrabold uppercase text-slate-600 tracking-wider">
                            {emailVerificationRequired 
                              ? (isKhmer ? 'អ៊ីមែល ឬ លេខទូរស័ព្ទ' : 'Email or Phone Number') 
                              : (isKhmer ? 'លេខទូរស័ព្ទ' : 'Phone Number')}
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                              <Phone className="w-4.5 h-4.5" />
                            </div>
                            <input
                              type="text"
                              value={loginEmail}
                              onChange={(e) => setLoginEmail(e.target.value)}
                              placeholder={emailVerificationRequired ? "012 345 678 or name@domain.com" : "012 345 678"}
                              className="w-full rounded-2xl bg-slate-50/90 border border-slate-200 focus:bg-white pl-12 pr-4 py-3.5 text-[14px] text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-medium transition-all"
                              required
                            />
                          </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <label className="block text-[11px] font-extrabold uppercase text-slate-600 tracking-wider">
                              {isKhmer ? 'ពាក្យសម្ងាត់' : 'Password'}
                            </label>
                            <button 
                              type="button" 
                              onClick={() => { setForgotEmail(loginEmail); setView('forgot'); }} 
                              className="text-[12px] text-emerald-600 hover:text-emerald-700 font-bold cursor-pointer transition hover:underline"
                            >
                              {isKhmer ? 'ភ្លេចពាក្យសម្ងាត់?' : 'Forgot Password?'}
                            </button>
                          </div>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                              <Lock className="w-4.5 h-4.5" />
                            </div>
                            <input
                              type={showLoginPassword ? 'text' : 'password'}
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              placeholder="••••••••••••"
                              className="w-full rounded-2xl bg-slate-50/90 border border-slate-200 focus:bg-white pl-12 pr-12 py-3.5 text-[14px] text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-medium transition-all"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowLoginPassword(!showLoginPassword)}
                              className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer select-none"
                            >
                              {showLoginPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                            </button>
                          </div>
                        </div>

                        {/* Submit Button with Animated Shimmer */}
                        <div className="pt-2">
                          <button
                            type="submit"
                            disabled={loginLoading}
                            className="shimmer-btn relative overflow-hidden w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-[15.5px] tracking-wide py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 active:scale-98 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <div className="shimmer-layer absolute inset-0 w-1/2 h-full bg-white/30 transform -skew-x-12 pointer-events-none -translate-x-full" />
                            
                            {loginLoading ? (
                              <span className="flex items-center gap-2"><RefreshCw className="w-4.5 h-4.5 animate-spin" /> LOGGING IN...</span>
                            ) : (
                              <>
                                <span>{isKhmer ? 'ចូលប្រើប្រាស់' : 'LOG IN'}</span>
                                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                              </>
                            )}
                          </button>
                        </div>

                      </form>
                    )}

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-5">
                      <div className="h-[1px] bg-slate-200 flex-grow" />
                      <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">or</span>
                      <div className="h-[1px] bg-slate-200 flex-grow" />
                    </div>

                    {/* Google OAuth Button */}
                    <button
                      type="button"
                      onClick={() => window.location.href = API + '/auth/google'}
                      className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 font-bold text-[13.5px] py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2.5 transition active:scale-98 cursor-pointer shadow-xs"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.61c-.29 1.5-.14 3.01-.97 4.29l3.1 2.4c1.8-1.66 2.8-4.11 2.8-6.54z" />
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.1-2.4c-.9.6-2.01.99-3.23.99-3.11 0-5.74-2.11-6.68-4.96l-3.2 2.48C5.69 21.09 8.63 24 12 24z" />
                        <path fill="#FBBC05" d="M5.32 14.72a7.16 7.16 0 0 1 0-4.55l-3.2-2.48a11.94 11.94 0 0 0 0 10.43l3.2-2.4c-.38-.3-.38-.7-.38-1z" />
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 8.63 0 5.69 2.91 3.72 6.79l3.2 2.48C7.86 6.36 10.49 4.75 12 4.75z" />
                      </svg>
                      <span>{isKhmer ? 'ចូលតាមរយៈ Google' : 'Sign in with Google'}</span>
                    </button>

                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* VIEW B: REGISTER / CREATE ACCOUNT FORM */}
                {/* ------------------------------------------------------------- */}
                {view === 'register' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="text-left mb-6">
                      <h2 className="text-[26px] font-black text-slate-900 tracking-tight">
                        {isKhmer ? 'បង្កើតគណនីថ្មី' : 'Create Account'}
                      </h2>
                      <p className="text-[13.5px] text-slate-500 font-medium mt-1">
                        {isKhmer ? 'ចាប់ផ្តើមដំណើរការឥណទាន និងការគ្រប់គ្រងហិរញ្ញវត្ថុ' : 'Get started in less than 2 minutes'}
                      </p>
                    </div>

                    {!registerOtpSent ? (
                      <form onSubmit={handleRegisterSubmit} className="space-y-4">
                        
                        {/* Full Name */}
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-extrabold uppercase text-slate-600 tracking-wider">
                            {isKhmer ? 'ឈ្មោះពេញ' : 'Full Name'}
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                              <User className="w-4.5 h-4.5" />
                            </div>
                            <input
                              type="text"
                              value={registerName}
                              onChange={(e) => setRegisterName(e.target.value)}
                              placeholder="e.g. John Doe"
                              className="w-full bg-slate-50/90 border border-slate-200 focus:bg-white rounded-2xl pl-12 pr-4 py-3.5 text-[14px] text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-medium transition-all"
                              required
                            />
                          </div>
                        </div>

                        {/* Email Address (if enabled) */}
                        {emailVerificationRequired && (
                          <div className="space-y-1.5">
                            <label className="block text-[11px] font-extrabold uppercase text-slate-600 tracking-wider">
                              {isKhmer ? 'អាសយដ្ឋានអ៊ីមែល' : 'Email Address'}
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                                <span className="text-[16px] font-light select-none">@</span>
                              </div>
                              <input
                                type="email"
                                value={registerEmail}
                                onChange={(e) => setRegisterEmail(e.target.value)}
                                placeholder="name@domain.com"
                                className="w-full bg-slate-50/90 border border-slate-200 focus:bg-white rounded-2xl pl-12 pr-4 py-3.5 text-[14px] text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-medium transition-all"
                                required
                              />
                            </div>
                          </div>
                        )}

                        {/* Phone Number */}
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-extrabold uppercase text-slate-600 tracking-wider">
                            {isKhmer ? 'លេខទូរស័ព្ទ' : 'Phone Number'}
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                              <Phone className="w-4.5 h-4.5" />
                            </div>
                            <input
                              type="tel"
                              value={registerPhone}
                              onChange={(e) => setRegisterPhone(e.target.value)}
                              placeholder="012 345 678"
                              className="w-full bg-slate-50/90 border border-slate-200 focus:bg-white rounded-2xl pl-12 pr-4 py-3.5 text-[14px] text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-medium transition-all"
                              required
                            />
                          </div>
                        </div>

                        {/* Password & Confirm */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="block text-[11px] font-extrabold uppercase text-slate-600 tracking-wider">
                              {isKhmer ? 'ពាក្យសម្ងាត់' : 'Password'}
                            </label>
                            <div className="relative">
                              <input
                                type={showRegisterPassword ? 'text' : 'password'}
                                value={registerPassword}
                                onChange={(e) => setRegisterPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-slate-50/90 border border-slate-200 focus:bg-white rounded-2xl pl-4 pr-10 py-3.5 text-[14px] text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-mono transition-all"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer select-none"
                              >
                                {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-[11px] font-extrabold uppercase text-slate-600 tracking-wider">
                              {isKhmer ? 'ផ្ទៀងផ្ទាត់' : 'Confirm'}
                            </label>
                            <div className="relative">
                              <input
                                type={showRegisterConfirmPassword ? 'text' : 'password'}
                                value={registerConfirmPassword}
                                onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-slate-50/90 border border-slate-200 focus:bg-white rounded-2xl pl-4 pr-10 py-3.5 text-[14px] text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-mono transition-all"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer select-none"
                              >
                                {showRegisterConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Submit Action */}
                        <div className="pt-3">
                          <button
                            type="submit"
                            disabled={registerLoading}
                            className="shimmer-btn relative overflow-hidden w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-[15.5px] tracking-wide py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                          >
                            <div className="shimmer-layer absolute inset-0 w-1/2 h-full bg-white/30 transform -skew-x-12 pointer-events-none -translate-x-full" />
                            {registerLoading ? (
                              <span className="flex items-center gap-2"><RefreshCw className="w-4.5 h-4.5 animate-spin" /> CREATING ACCOUNT...</span>
                            ) : (
                              <>
                                <span>{isKhmer ? 'បង្កើតគណនី' : 'CREATE ACCOUNT'}</span>
                                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                              </>
                            )}
                          </button>
                        </div>

                      </form>
                    ) : (
                      /* Multi-Channel Verification Step */
                      <div className="space-y-6">
                        
                        {/* Channel selector tabs */}
                        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                          {emailVerificationRequired ? (
                            <button
                              type="button"
                              onClick={() => handleTabChange('email')}
                              className={`flex-1 py-2 text-[12.5px] font-bold rounded-xl transition cursor-pointer ${
                                verifyMethod === 'email' ? 'bg-white text-emerald-700 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              📧 Email
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleTabChange('sms')}
                              className={`flex-1 py-2 text-[12.5px] font-bold rounded-xl transition cursor-pointer ${
                                verifyMethod === 'sms' ? 'bg-white text-emerald-700 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              💬 SMS OTP
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleTabChange('telegram')}
                            className={`flex-1 py-2 text-[12.5px] font-bold rounded-xl transition cursor-pointer ${
                              verifyMethod === 'telegram' ? 'bg-white text-cyan-700 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            📱 Telegram
                          </button>
                        </div>

                        {verifyMethod === 'email' || verifyMethod === 'sms' ? (
                          <form onSubmit={handleVerifyRegisterOtp} className="space-y-5">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                              <p className="text-[12.5px] text-slate-600 font-medium">
                                Code sent to <strong className="text-emerald-700">{verifyMethod === 'sms' ? registerPhone : registerEmail}</strong>
                              </p>
                            </div>
                            <input
                              type="text"
                              maxLength={6}
                              value={registerOtpCode}
                              onChange={(e) => setRegisterOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              placeholder="000000"
                              className="w-full text-center text-[28px] tracking-[10px] font-mono rounded-2xl bg-slate-50 border border-slate-200 px-6 py-4 text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-inner font-bold"
                              required
                            />
                            <button
                              type="submit"
                              disabled={registerLoading || registerOtpCode.length < 6}
                              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-[15px] py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition cursor-pointer disabled:opacity-50"
                            >
                              {registerLoading ? (
                                <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> VERIFYING...</span>
                              ) : (
                                <>{isKhmer ? 'ផ្ទៀងផ្ទាត់កូដ' : 'VERIFY CODE'} <ArrowRight className="w-5 h-5 stroke-[2.5]" /></>
                              )}
                            </button>
                            <div className="flex justify-between items-center text-[12.5px]">
                              <button type="button" onClick={handleResendRegisterOtp} disabled={registerOtpTimer > 0}
                                className="text-slate-500 hover:text-emerald-700 cursor-pointer disabled:opacity-40 font-semibold"
                              >
                                Resend code {registerOtpTimer > 0 && `(${Math.floor(registerOtpTimer / 60)}:${String(registerOtpTimer % 60).padStart(2, '0')})`}
                              </button>
                              <button type="button" onClick={() => { setRegisterOtpSent(false); setRegisterOtpCode(''); }}
                                className="text-slate-500 hover:text-slate-900 cursor-pointer font-medium"
                              >
                                Change details
                              </button>
                            </div>
                          </form>
                        ) : (
                          /* Telegram Link & OTP */
                          <div className="space-y-4">
                            {!emailVerificationRequired ? (
                              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
                                <h4 className="text-[13.5px] font-bold text-slate-900 flex items-center gap-2">
                                  <span>🔗 Link Telegram to Activate Profile</span>
                                </h4>
                                <p className="text-[12px] text-slate-600 leading-relaxed font-medium">
                                  Press below to open our Telegram Bot and share your contact to activate instantly.
                                </p>
                                <a
                                  href={`https://t.me/nexusfinancefintech_bot?start=${registeredUserId}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={() => {
                                    const pollInterval = setInterval(async () => {
                                      try {
                                        const res = await fetch(`${API}/auth/check-link?userId=${registeredUserId}`);
                                        const data = await res.json();
                                        if (data.linked) {
                                          clearInterval(pollInterval);
                                          showToast('Telegram account linked and verified successfully!', 'success');
                                          if (data.token) onLoginSuccess(data.token);
                                          else { setView('login'); setRegisterOtpSent(false); }
                                        }
                                      } catch (e) { console.error(e); }
                                    }, 2000);
                                    setTimeout(() => clearInterval(pollInterval), 300000);
                                  }}
                                  className="w-full bg-[#1c8ad4] hover:bg-[#197bc0] text-white font-bold text-[14px] py-3.5 rounded-2xl flex items-center justify-center gap-2 transition shadow-md cursor-pointer text-center"
                                >
                                  💬 Open Telegram Bot
                                </a>
                              </div>
                            ) : !tgOtpSent ? (
                              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
                                <h4 className="text-[13.5px] font-bold text-slate-900 flex items-center gap-2">
                                  <span>🔗 Link Telegram & Receive OTP</span>
                                </h4>
                                <p className="text-[12px] text-slate-600 leading-relaxed font-medium">
                                  Link your Telegram account to phone <strong className="text-emerald-700">{registerPhone}</strong> to get your verification code instantly:
                                </p>
                                <a
                                  href="https://t.me/nexusfinancefintech_bot"
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={() => {
                                    setTgOtpSent(true);
                                    setTgOtpTimer(300);
                                    const interval = setInterval(() => {
                                      setTgOtpTimer(prev => { if (prev <= 1) clearInterval(interval); return prev - 1; });
                                    }, 1000);
                                    const pollInterval = setInterval(async () => {
                                      try {
                                        const res = await fetch(`${API}/auth/check-link?phone=${encodeURIComponent(registerPhone)}`);
                                        const data = await res.json();
                                        if (data.linked) {
                                          setTelegramLinked(true);
                                          clearInterval(pollInterval);
                                        }
                                      } catch (e) { console.error(e); }
                                    }, 2000);
                                    setTimeout(() => clearInterval(pollInterval), 300000);
                                  }}
                                  className="w-full bg-[#1c8ad4] hover:bg-[#197bc0] text-white font-bold text-[14px] py-3.5 rounded-2xl flex items-center justify-center gap-2 transition shadow-md cursor-pointer text-center"
                                >
                                  💬 Link & Get Code on Telegram
                                </a>
                              </div>
                            ) : (
                              <form onSubmit={handleVerifyTgOtp} className="space-y-4">
                                {telegramLinked ? (
                                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl p-3 text-[12.5px] font-bold flex items-center justify-center gap-2">
                                    <span>✅ Telegram linked successfully!</span>
                                  </div>
                                ) : (
                                  <div className="bg-slate-50 border border-slate-200 text-slate-600 rounded-2xl p-3 text-[12.5px] font-semibold flex items-center justify-center gap-2">
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-600" />
                                    <span>Waiting for Telegram link & code...</span>
                                  </div>
                                )}
                                <input
                                  type="text"
                                  maxLength={6}
                                  value={tgOtpCode}
                                  onChange={(e) => setTgOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                  placeholder="000000"
                                  className="w-full text-center text-[28px] tracking-[10px] font-mono rounded-2xl bg-slate-50 border border-slate-200 px-6 py-4 text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-inner font-bold"
                                  required
                                />
                                <button
                                  type="submit"
                                  disabled={registerLoading || tgOtpCode.length < 6}
                                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-[15px] py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition cursor-pointer disabled:opacity-50"
                                >
                                  {registerLoading ? (
                                    <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> VERIFYING...</span>
                                  ) : (
                                    <>{isKhmer ? 'ផ្ទៀងផ្ទាត់កូដ' : 'VERIFY CODE'} <ArrowRight className="w-5 h-5 stroke-[2.5]" /></>
                                  )}
                                </button>
                                <div className="flex justify-between items-center text-[12.5px]">
                                  <button type="button" onClick={() => handleSendTgOtp()} disabled={tgOtpTimer > 0}
                                    className="text-slate-500 hover:text-emerald-700 cursor-pointer disabled:opacity-40 font-semibold"
                                  >
                                    Resend code {tgOtpTimer > 0 && `(${Math.floor(tgOtpTimer / 60)}:${String(tgOtpTimer % 60).padStart(2, '0')})`}
                                  </button>
                                  <button type="button" onClick={() => { setRegisterOtpSent(false); setTgOtpSent(false); }}
                                    className="text-slate-500 hover:text-slate-900 cursor-pointer font-medium"
                                  >
                                    Change phone
                                  </button>
                                </div>
                              </form>
                            )}
                          </div>
                        )}

                      </div>
                    )}

                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* VIEW C: FORGOT PASSWORD FORM */}
                {/* ------------------------------------------------------------- */}
                {view === 'forgot' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    
                    <div className="text-left mb-6">
                      <h2 className="text-[26px] font-black text-slate-900 tracking-tight">
                        {showResetForm 
                          ? (isKhmer ? 'កំណត់ពាក្យសម្ងាត់ថ្មី' : 'Set New Password') 
                          : (isKhmer ? 'សង្គ្រោះពាក្យសម្ងាត់' : 'Reset Password')}
                      </h2>
                      <p className="text-[13.5px] text-slate-500 font-medium mt-1">
                        {isKhmer ? 'យើងនឹងផ្ញើលេខកូដសម្ងាត់ដើម្បីផ្ទៀងផ្ទាត់គណនីរបស់អ្នក' : 'Recover your account access safely'}
                      </p>
                    </div>

                    {!forgotOtpSent && !showResetForm ? (
                      /* Step 1: Input email or phone */
                      <form onSubmit={handleSendForgotOtp} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-extrabold uppercase text-slate-600 tracking-wider">
                            {emailVerificationRequired 
                              ? (isKhmer ? 'អ៊ីមែល ឬ លេខទូរស័ព្ទ' : 'Email or Phone Number') 
                              : (isKhmer ? 'លេខទូរស័ព្ទ' : 'Phone Number')}
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                              <Lock className="w-4.5 h-4.5" />
                            </div>
                            <input
                              type={emailVerificationRequired ? 'text' : 'tel'}
                              placeholder={emailVerificationRequired ? 'name@domain.com or 012 345 678' : '012 345 678'}
                              value={forgotEmail}
                              onChange={(e) => setForgotEmail(e.target.value)}
                              className="w-full pl-12 pr-4 py-3.5 bg-slate-50/90 border border-slate-200 focus:bg-white rounded-2xl text-[14px] font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                              required
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={forgotLoading}
                          className="shimmer-btn relative overflow-hidden w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-[15px] py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition cursor-pointer disabled:opacity-50"
                        >
                          <div className="shimmer-layer absolute inset-0 w-1/2 h-full bg-white/30 transform -skew-x-12 pointer-events-none -translate-x-full" />
                          {forgotLoading ? (
                            <span className="flex items-center gap-2"><RefreshCw className="w-4.5 h-4.5 animate-spin" /> SENDING OTP...</span>
                          ) : (
                            <>{isKhmer ? 'ផ្ញើលេខកូដ OTP' : 'SEND OTP CODE'} <ArrowRight className="w-5 h-5 stroke-[2.5]" /></>
                          )}
                        </button>
                      </form>
                    ) : forgotOtpSent && !showResetForm ? (
                      /* Step 2: Input OTP */
                      <form onSubmit={handleVerifyForgotOtp} className="space-y-5">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                          <p className="text-[12.5px] text-slate-600 font-medium">
                            Enter the code sent to <strong className="text-emerald-700">{forgotEmail}</strong>
                          </p>
                        </div>
                        <input
                          type="text"
                          maxLength={6}
                          value={forgotOtpCode}
                          onChange={(e) => setForgotOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="000000"
                          className="w-full text-center text-[28px] tracking-[10px] font-mono rounded-2xl bg-slate-50 border border-slate-200 px-6 py-4 text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-inner font-bold"
                          required
                        />
                        <button
                          type="submit"
                          disabled={forgotLoading || forgotOtpCode.length < 6}
                          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-[15px] py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition cursor-pointer disabled:opacity-50"
                        >
                          {forgotLoading ? (
                            <span className="flex items-center gap-2"><RefreshCw className="w-4.5 h-4.5 animate-spin" /> VERIFYING...</span>
                          ) : (
                            <>{isKhmer ? 'ផ្ទៀងផ្ទាត់' : 'VERIFY CODE'} <ArrowRight className="w-5 h-5 stroke-[2.5]" /></>
                          )}
                        </button>
                        <div className="flex justify-between items-center text-[12.5px]">
                          <button type="button" onClick={handleResendForgotOtp} disabled={forgotOtpTimer > 0}
                            className="text-slate-500 hover:text-emerald-700 cursor-pointer disabled:opacity-40 font-semibold"
                          >
                            Resend code {forgotOtpTimer > 0 && `(${Math.floor(forgotOtpTimer / 60)}:${String(forgotOtpTimer % 60).padStart(2, '0')})`}
                          </button>
                          <button type="button" onClick={() => { setForgotOtpSent(false); setForgotOtpCode(''); }}
                            className="text-slate-500 hover:text-slate-900 cursor-pointer font-medium"
                          >
                            Change input
                          </button>
                        </div>
                      </form>
                    ) : (
                      /* Step 3: New Password Input */
                      <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-extrabold uppercase text-slate-600 tracking-wider">
                            {isKhmer ? 'ពាក្យសម្ងាត់ថ្មី' : 'New Password'}
                          </label>
                          <input 
                            type="password" 
                            value={resetPassword} 
                            onChange={(e) => setResetPassword(e.target.value)} 
                            placeholder="Min 6 characters" 
                            className="w-full px-4 py-3.5 bg-slate-50/90 border border-slate-200 focus:bg-white rounded-2xl text-[14px] font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all" 
                            required 
                            minLength={6} 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-extrabold uppercase text-slate-600 tracking-wider">
                            {isKhmer ? 'ផ្ទៀងផ្ទាត់ពាក្យសម្ងាត់ថ្មី' : 'Confirm New Password'}
                          </label>
                          <input 
                            type="password" 
                            value={resetConfirmPassword} 
                            onChange={(e) => setResetConfirmPassword(e.target.value)} 
                            placeholder="Re-enter new password" 
                            className="w-full px-4 py-3.5 bg-slate-50/90 border border-slate-200 focus:bg-white rounded-2xl text-[14px] font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all" 
                            required 
                            minLength={6} 
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={forgotLoading}
                          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-[15px] py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition cursor-pointer disabled:opacity-50"
                        >
                          {forgotLoading ? (
                            <span className="flex items-center gap-2"><RefreshCw className="w-4.5 h-4.5 animate-spin" /> SAVING...</span>
                          ) : (
                            <>{isKhmer ? 'រក្សាទុកពាក្យសម្ងាត់' : 'SAVE NEW PASSWORD'} <ArrowRight className="w-5 h-5 stroke-[2.5]" /></>
                          )}
                        </button>
                      </form>
                    )}

                    {/* Back to login trigger */}
                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => { setView('login'); setForgotOtpSent(false); setShowResetForm(false); }}
                        className="text-[13px] font-bold text-slate-500 hover:text-slate-900 cursor-pointer transition inline-flex items-center gap-1.5"
                      >
                        ← {isKhmer ? 'ត្រឡប់ទៅការចូលប្រើ' : 'Back to Login'}
                      </button>
                    </div>

                  </div>
                )}

              </div>
            </div>

          </div>
        </main>

        {/* Global Footer */}
        <footer className="relative z-20 px-6 py-4 sm:px-12 border-t border-slate-200/60 bg-white/40 backdrop-blur-xs flex flex-col md:flex-row justify-between items-center gap-3 text-[12px] font-medium text-slate-500">
          <div>
            <p>© 2026 Nexus Finance Inc. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <a href="/privacy" className="hover:text-slate-800 transition">Privacy Policy</a>
            <a href="/terms" className="hover:text-slate-800 transition">Terms of Service</a>
            <a href="/privacy" className="hover:text-slate-800 transition">Regulatory Disclosure</a>
            <a href="/privacy" className="hover:text-slate-800 transition">Bank-Grade Security</a>
          </div>
        </footer>

      </div>
    </div>
  );
}
