import React, { useState, useEffect } from 'react';
import { X, Mic, MicOff, Video, VideoOff, ScreenShare, PhoneOff, CheckSquare, Square, ShieldCheck, Award } from 'lucide-react';

interface LiveMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicantName: string;
  regardingLoan: string;
  onCompleteKyc: () => void;
}

export default function LiveMeetingModal({
  isOpen,
  onClose,
  applicantName,
  regardingLoan,
  onCompleteKyc
}: LiveMeetingModalProps) {
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoStopped, setIsVideoStopped] = useState(false);
  const [checklist, setChecklist] = useState({
    idVerified: false,
    companyDocs: false,
    cashflowApproved: false,
    agreementsSigned: false,
  });
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setTimerSeconds(0);
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleChecklistItem = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecked = Object.values(checklist).every(Boolean);

  const handleFinishVerification = () => {
    setShowSuccess(true);
    setTimeout(() => {
      onCompleteKyc();
      setShowSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="KYC verification meeting" className="fixed inset-0 bg-[var(--modal-overlay)] backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="text-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden relative flex flex-col md:flex-row h-[550px] font-sans" style={{ backgroundColor: 'var(--card-dark-bg)', border: '1px solid var(--border-primary)' }}>
        
        {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white/70 hover:text-white transition"
          >
          <X className="w-5 h-5" />
        </button>

        {showSuccess ? (
          /* Verification complete visualizer */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center" style={{ backgroundColor: 'var(--card-dark-bg)' }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 animate-bounce"
              style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent)' }}
            >
              <ShieldCheck className="w-12 h-12 stroke-[2.5]" />
            </div>
            <h3 className="text-[26px] font-bold text-white mb-2">KYC Verified Successfully</h3>
            <p className="text-[14px] text-slate-300 max-w-sm mb-6 leading-relaxed">
              Auditor signatures applied. {applicantName}'s eligibility assessment is updated with positive KYC approval flag.
            </p>
            <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full animate-pulse w-full" style={{ backgroundColor: 'var(--accent)' }}></div>
            </div>
          </div>
        ) : (
          <>
            {/* Left Box: Video Feeds */}
            <div className="flex-1 p-6 flex flex-col justify-between border-r relative bg-black/30" style={{ borderColor: 'var(--border-primary)' }}>
              
              {/* Meeting Header */}
              <div className="flex justify-between items-center mb-4 z-10 bg-black/20 p-2.5 rounded-lg border border-white/5">
                <div>
                  <h4 className="text-[13px] uppercase tracking-wider font-bold" style={{ color: 'var(--accent)' }}>Secure KYC Terminal</h4>
                  <p className="text-[14px] font-semibold text-white">{regardingLoan}</p>
                </div>
                <div className="text-right flex items-center gap-2">
                  <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--accent)" strokeWidth="3" strokeDasharray={`${(timerSeconds % 60) / 60 * 97.4} 97.4`} strokeLinecap="round" />
                  </svg>
                  <span className="text-[12px] font-mono select-none px-2.5 py-1 rounded"
                    style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent)' }}
                  >
                    {formatTime(timerSeconds)}
                  </span>
                </div>
              </div>

              {/* Feed grids */}
              <div className="flex-1 grid grid-cols-2 gap-4 h-full relative z-10">
                {/* Applicant feed */}
                <div className="bg-slate-800 rounded-xl overflow-hidden border border-white/5 flex flex-col justify-between p-3 relative shadow-inner">
                  {isVideoStopped ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-0">
                      <VideoOff className="w-10 h-10 text-slate-400" />
                      <span className="text-[11px] text-slate-400 mt-2">Camera Stopped</span>
                    </div>
                  ) : (
                    <>
                      {/* Simulated video frame */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 to-transparent z-0">
                        {/* We add a stylish pattern representation for applicant */}
                        <div className="absolute inset-0 flex items-center justify-center bg-teal-900/10">
                        <div className="w-24 h-24 rounded-full bg-slate-700/50 flex items-center justify-center border-4 select-none"
                          style={{ borderColor: 'var(--accent-muted)' }}
                        >
                          <span className="text-[32px] font-extrabold tracking-tight" style={{ color: 'var(--accent)' }}>{applicantName.split(' ').map(n=>n[0]).join('')}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  <span className="z-10 bg-black/50 text-[11px] px-2 py-0.5 rounded font-bold tracking-wide w-fit border border-white/5 self-start uppercase">
                    Applicant: {applicantName}
                  </span>
                  <div className="z-10 flex items-center gap-1.5 self-end">
                    <span className="w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: 'var(--accent)' }}></span>
                    <span className="text-[11px] font-mono text-slate-300">Live Audio Audio stream</span>
                  </div>
                </div>

                {/* Secure Auditor feed (You) */}
                <div className="bg-slate-800 rounded-xl overflow-hidden border border-white/5 flex flex-col justify-between p-3 relative shadow-inner">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 to-transparent z-0">
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/20">
                      <div className="w-20 h-20 rounded-full flex items-center justify-center border border-white/10 select-none animate-pulse-subtle"
                        style={{ backgroundColor: 'var(--card-dark-bg)' }}
                      >
                        <Award className="w-10 h-10" style={{ color: 'var(--accent)' }} />
                      </div>
                    </div>
                  </div>
                  <span className="z-10 bg-black/50 text-[11px] px-2 py-0.5 rounded font-bold tracking-wide w-fit border border-white/5 self-start">
                    You (Nexus Officer)
                  </span>
                  <div className="z-10 flex items-center gap-1.5 self-end text-[11px] font-mono text-slate-300">
                    {isAudioMuted ? <MicOff className="w-3.5 h-3.5" style={{ color: 'var(--error-text)' }} /> : <Mic className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />}
                    <span>Encrypted</span>
                  </div>
                </div>
              </div>

              {/* Feed Actions Buttons */}
              <div className="flex justify-center items-center gap-4 mt-5 z-10">
                <button
                  onClick={() => setIsAudioMuted(!isAudioMuted)}
                  className={`p-3 rounded-full border transition cursor-pointer ${
                    isAudioMuted ? 'bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30' : 'bg-slate-800 border-white/10 text-white hover:bg-slate-700'
                  }`}
                  title={isAudioMuted ? "Unmute Mic" : "Mute Mic"}
                >
                  {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <button
                  onClick={() => setIsVideoStopped(!isVideoStopped)}
                  className={`p-3 rounded-full border transition cursor-pointer ${
                    isVideoStopped ? 'bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30' : 'bg-slate-800 border-white/10 text-white hover:bg-slate-700'
                  }`}
                  title={isVideoStopped ? "Start Camera" : "Stop Camera"}
                >
                  {isVideoStopped ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>

                <button
                  className="p-3 rounded-full bg-slate-800 border border-white/10 text-white hover:bg-slate-700 transition cursor-pointer"
                  title="Share Desktop"
                >
                  <ScreenShare className="w-5 h-5" />
                </button>

                <button
                  onClick={onClose}
                  className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition cursor-pointer"
                  title="Disconnect Call"
                >
                  <PhoneOff className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Right Box: Call checklist panel */}
            <div className="w-full md:w-80 bg-slate-900 p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-white mb-1.5 flex items-center gap-1.5">
                  <CheckSquare className="w-4.5 h-4.5" style={{ color: 'var(--accent)' }} /> Verify Checkpoints
                </h3>
                <p className="text-[11.5px] text-slate-400 mb-6 font-medium">Toggle these items during interview verification, all indicators must be met.</p>

                <div className="space-y-4">
                  <button type="button"
                    onClick={() => toggleChecklistItem('idVerified')}
                    className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-slate-800/60 cursor-pointer select-none transition border border-transparent hover:border-white/5 text-left"
                  >
                    {checklist.idVerified ? (
                      <CheckSquare className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="text-[13px] font-bold block text-white">Government ID Match</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Physical card match portrait face frame.</span>
                    </div>
                  </button>

                  <button type="button"
                    onClick={() => toggleChecklistItem('companyDocs')}
                    className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-slate-800/60 cursor-pointer select-none transition border border-transparent hover:border-white/5 text-left"
                  >
                    {checklist.companyDocs ? (
                      <CheckSquare className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="text-[13px] font-bold block text-white">Tax/Registration Docs</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Verify legitimate registration files and audit references.</span>
                    </div>
                  </button>

                  <button type="button"
                    onClick={() => toggleChecklistItem('cashflowApproved')}
                    className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-slate-800/60 cursor-pointer select-none transition border border-transparent hover:border-white/5 text-left"
                  >
                    {checklist.cashflowApproved ? (
                      <CheckSquare className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="text-[13px] font-bold block text-white">Veritable Cashflow</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Corroborate income states against bank receipts.</span>
                    </div>
                  </button>

                  <button type="button"
                    onClick={() => toggleChecklistItem('agreementsSigned')}
                    className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-slate-800/60 cursor-pointer select-none transition border border-transparent hover:border-white/5 text-left"
                  >
                    {checklist.agreementsSigned ? (
                      <CheckSquare className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="text-[13px] font-bold block text-white">Terms Verbal Agreement</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Agreement to interest matrices, schedules.</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Verified Trigger Button */}
              <div className="pt-4 border-t border-white/5">
                <button
                  disabled={!allChecked}
                  onClick={handleFinishVerification}
                  className={`w-full py-3.5 rounded-xl text-[13.5px] font-sans font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    allChecked
                      ? 'premium-btn-primary shadow-md'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                  }`}
                >
                  <ShieldCheck className="w-4.5 h-4.5" />
                  Complete KYC Verification
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
