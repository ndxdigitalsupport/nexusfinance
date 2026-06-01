import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Telegram Mini App — expand to full screen
declare global { interface Window { Telegram?: any; } }
try { window.Telegram?.WebApp?.expand(); } catch {}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
