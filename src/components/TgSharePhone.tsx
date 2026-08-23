import React, { useEffect } from 'react';

export default function TgSharePhone() {
  useEffect(() => {
    // Automatically trigger requestContact popup inside Telegram WebApp
    const webApp = (window as any).Telegram?.WebApp;
    if (webApp) {
      webApp.ready();
      webApp.requestContact((shared: boolean) => {
        // Close the WebApp window immediately after sharing or cancelling
        webApp.close();
      });
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--surface-primary)' }}>
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl border" style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-primary)' }}>
        <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-[var(--accent)]/10 animate-pulse">
          <svg className="w-8 h-8 text-[var(--accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            Linking Telegram Account
          </h1>
          <p className="text-sm mt-2 text-[var(--text-secondary)] leading-relaxed">
            Please tap the popup dialog to share your phone number with our bot.
          </p>
        </div>
      </div>
    </div>
  );
}
