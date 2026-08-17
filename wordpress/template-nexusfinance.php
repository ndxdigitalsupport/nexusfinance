<?php
/* Template Name: NexusFinance Landing */
?><!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Nexusfinance — All-in-One FinTech Ecosystem</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=Noto+Sans+Khmer:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
:root {
  --teal: #00BDAA;
  --teal-md: #1AB7A0;
  --teal-dk: #009688;
  --navy: #011B2A;
  --navy-dk: #000F18;
  --bg: #0A0F1A;
  --text: #F1F5F9;
  --card: #0F1623;
  --card-border: rgba(0,189,170,0.08);
  --muted: #94A3B8;
  --sub: #64748B;
  --radius-sm: 12px;
  --radius-md: 20px;
  --radius-lg: 32px;
  --radius-pill: 9999px;
  --bounce: cubic-bezier(0.32,0.72,0,1);
  --ease: cubic-bezier(0.22,1,0.36,1);
}
[data-theme="light"] {
  --bg: #F8FAFC;
  --text: #0F172A;
  --card: #FFFFFF;
  --card-border: rgba(0,189,170,0.15);
  --muted: #64748B;
  --sub: #94A3B8;
}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth;scroll-padding-top:100px}
body{
  font-family:'Plus Jakarta Sans',system-ui,-apple-system,sans-serif;
  background:var(--bg);color:var(--text);
  transition:background .6s var(--bounce),color .6s var(--bounce);
  -webkit-font-smoothing:antialiased;
  overflow-x:hidden;
}
::selection{background:rgba(0,189,170,.3);color:var(--navy)}
::-webkit-scrollbar{width:5px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--teal);border-radius:var(--radius-pill)}
a{text-decoration:none;color:inherit}
button{cursor:pointer;border:none;background:none;font:inherit;color:inherit}
img{max-width:100%;display:block}
input{font:inherit}
/* ===== NAV ===== */
.nav-island{
  position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:100;
  background:rgba(10,15,26,.75);backdrop-filter:blur(24px) saturate(1.4);
  -webkit-backdrop-filter:blur(24px) saturate(1.4);
  border:1px solid rgba(255,255,255,.06);
  border-radius:var(--radius-pill);
  padding:8px 20px 8px 8px;
  display:flex;align-items:center;gap:8px;
  transition:all .5s var(--bounce);
  box-shadow:0 8px 40px rgba(0,0,0,.3);
}
[data-theme="light"] .nav-island{
  background:rgba(248,250,252,.8);
  border-color:rgba(0,0,0,.06);
  box-shadow:0 8px 40px rgba(0,0,0,.06);
}
.nav-island.scrolled{
  top:12px;padding:6px 16px 6px 6px;
  background:rgba(10,15,26,.88);
}
[data-theme="light"] .nav-island.scrolled{background:rgba(248,250,252,.88)}
.nav-logo{
  display:flex;align-items:center;gap:6px;
  font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:14px;
  letter-spacing:-.02em;padding:6px 12px;
  border-radius:var(--radius-pill);
  transition:all .3s var(--bounce);
  color:var(--teal);
}
.nav-links{display:none;align-items:center;gap:2px}
.nav-links a{
  padding:6px 14px;font-size:12px;font-weight:500;letter-spacing:.02em;
  border-radius:var(--radius-pill);
  transition:all .35s var(--bounce);
  color:var(--muted);position:relative;
}
.nav-links a:hover,.nav-links a.active{color:var(--text)}
.nav-links a.active{background:rgba(0,189,170,.1);color:var(--teal)}
.nav-actions{display:flex;align-items:center;gap:4px;margin-left:4px}
.nav-btn{
  width:32px;height:32px;border-radius:var(--radius-sm);
  display:flex;align-items:center;justify-content:center;
  transition:all .35s var(--bounce);
  color:var(--muted);font-size:13px;font-weight:700;
}
.nav-btn:hover{color:var(--text);background:rgba(255,255,255,.05)}
[data-theme="light"] .nav-btn:hover{background:rgba(0,0,0,.04)}
.nav-lang{
  display:flex;align-items:center;gap:0;
  background:rgba(255,255,255,.04);border-radius:var(--radius-pill);
  padding:2px;position:relative;overflow:hidden;
}
[data-theme="light"] .nav-lang{background:rgba(0,0,0,.04)}
.nav-lang-slider{
  position:absolute;top:2px;bottom:2px;width:30px;
  background:var(--teal);border-radius:var(--radius-pill);
  transition:transform .4s var(--bounce);
  z-index:0;
}
.nav-lang[data-lang="KH"] .nav-lang-slider{transform:translateX(30px)}
.nav-lang button{
  position:relative;z-index:1;
  width:30px;height:24px;font-size:10px;font-weight:700;
  border-radius:var(--radius-pill);
  transition:color .3s var(--bounce);color:var(--muted);
}
.nav-lang[data-lang="EN"] button:first-child,
.nav-lang[data-lang="KH"] button:last-child{color:#011B2A}
.nav-cta{
  display:none;align-items:center;gap:6px;
  background:var(--teal);color:var(--navy);font-weight:700;font-size:11px;
  padding:6px 14px;border-radius:var(--radius-pill);
  letter-spacing:.04em;text-transform:uppercase;
  transition:all .35s var(--bounce);white-space:nowrap;
}
.nav-cta:hover{background:var(--teal-md);transform:scale(1.03)}
.nav-cta svg{width:14px;height:14px;transition:transform .35s var(--bounce)}
.nav-cta:hover svg{transform:translateX(2px)}
.nav-hamburger{
  width:34px;height:34px;border-radius:var(--radius-sm);
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;
  transition:all .35s var(--bounce);color:var(--muted);position:relative;
}
.nav-hamburger:hover{background:rgba(255,255,255,.04)}
[data-theme="light"] .nav-hamburger:hover{background:rgba(0,0,0,.04)}
.nav-hamburger span{
  display:block;width:18px;height:2px;border-radius:2px;
  background:currentColor;transition:all .35s var(--bounce);transform-origin:center;
}
.nav-hamburger.open span:nth-child(1){transform:translateY(6px) rotate(45deg)}
.nav-hamburger.open span:nth-child(2){opacity:0;transform:scaleX(0)}
.nav-hamburger.open span:nth-child(3){transform:translateY(-6px) rotate(-45deg)}
@media(min-width:768px){
  .nav-links{display:flex}
  .nav-cta{display:flex}
  .nav-hamburger{display:none}
}
/* ===== MOBILE MENU ===== */
.mobile-overlay{
  position:fixed;inset:0;z-index:99;
  background:rgba(10,15,26,.85);backdrop-filter:blur(40px);
  -webkit-backdrop-filter:blur(40px);
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;
  opacity:0;pointer-events:none;transition:all .5s var(--bounce);
}
[data-theme="light"] .mobile-overlay{background:rgba(248,250,252,.85)}
.mobile-overlay.open{opacity:1;pointer-events:auto}
.mobile-overlay a{
  font-size:24px;font-weight:600;font-family:'Space Grotesk',sans-serif;
  color:var(--muted);transition:all .35s var(--bounce);
  transform:translateY(16px);opacity:0;
  transition:all .45s var(--bounce),opacity .45s var(--bounce),transform .45s var(--bounce);
}
.mobile-overlay.open a{transform:translateY(0);opacity:1}
.mobile-overlay a:nth-child(1){transition-delay:.1s}
.mobile-overlay a:nth-child(2){transition-delay:.18s}
.mobile-overlay a:nth-child(3){transition-delay:.26s}
.mobile-overlay a:hover,.mobile-overlay a.active{color:var(--teal)}
/* ===== SECTIONS ===== */
section{padding:100px 0;position:relative}
.container{width:100%;max-width:1200px;margin:0 auto;padding:0 20px}
@media(min-width:768px){.container{padding:0 32px}}
.section-badge{
  display:inline-flex;align-items:center;gap:6px;
  font-size:10px;font-weight:600;letter-spacing:.15em;text-transform:uppercase;
  padding:5px 14px;border-radius:var(--radius-pill);
  background:rgba(0,189,170,.08);border:1px solid rgba(0,189,170,.15);
  color:var(--teal);margin-bottom:16px;
}
.section-badge svg{width:12px;height:12px}
/* ===== HERO ===== */
#hero{min-height:100dvh;display:flex;align-items:center;padding-top:100px;overflow:hidden}
.hero-grid{display:grid;gap:48px;align-items:center}
@media(min-width:1024px){.hero-grid{grid-template-columns:1fr 1fr;gap:64px}}
.hero-tagline{
  display:inline-flex;align-items:center;gap:6px;
  font-size:11px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;
  padding:6px 14px;border-radius:var(--radius-pill);
  border:1px solid rgba(0,189,170,.2);
  background:rgba(0,189,170,.06);
  color:var(--teal);margin-bottom:24px;
}
.hero-tagline .dot{width:6px;height:6px;border-radius:50%;background:var(--teal);animation:pulse 2s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
.hero-title{
  font-family:'Space Grotesk',sans-serif;font-weight:700;
  font-size:clamp(2rem,5vw,3.5rem);line-height:1.08;letter-spacing:-.03em;
  margin-bottom:20px;
}
.hero-title em{font-style:normal;color:var(--teal)}
.hero-desc{
  font-size:15px;line-height:1.7;color:var(--muted);
  max-width:520px;margin-bottom:32px;font-weight:400;
}
.hero-actions{display:flex;flex-wrap:wrap;gap:12px}
.btn-primary{
  display:inline-flex;align-items:center;gap:8px;
  background:var(--teal);color:var(--navy);font-weight:700;font-size:13px;
  padding:12px 24px;border-radius:var(--radius-pill);
  letter-spacing:.03em;text-transform:uppercase;
  transition:all .4s var(--bounce);
}
.btn-primary:hover{background:var(--teal-md);transform:translateY(-2px);box-shadow:0 12px 32px rgba(0,189,170,.2)}
.btn-primary .icon-wrap{
  width:24px;height:24px;border-radius:50%;
  background:rgba(0,27,42,.15);display:flex;align-items:center;justify-content:center;
  transition:all .4s var(--bounce);
}
.btn-primary:hover .icon-wrap{transform:translateX(3px) scale(1.05)}
.btn-primary svg{width:12px;height:12px}
.btn-secondary{
  display:inline-flex;align-items:center;gap:8px;
  border:1px solid rgba(255,255,255,.1);color:var(--text);font-weight:600;font-size:13px;
  padding:12px 24px;border-radius:var(--radius-pill);
  transition:all .4s var(--bounce);
}
[data-theme="light"] .btn-secondary{border-color:rgba(0,0,0,.1);color:var(--text)}
.btn-secondary:hover{border-color:var(--teal);background:rgba(0,189,170,.04)}
/* ===== DASHBOARD CARD ===== */
.dashboard-wrap{
  position:relative;
}
.dashboard-glow{
  position:absolute;inset:-40px;
  background:radial-gradient(ellipse at center,rgba(0,189,170,.06),transparent 70%);
  border-radius:50%;pointer-events:none;animation:pulse 4s ease-in-out infinite;
}
.dashboard-card{
  position:relative;
  padding:2px;border-radius:var(--radius-lg);
  background:linear-gradient(135deg,rgba(0,189,170,.15),rgba(0,189,170,.02));
  box-shadow:0 24px 80px rgba(0,0,0,.3);
}
.dashboard-inner{
  background:linear-gradient(160deg,#0D1A26,#050D14);
  border-radius:calc(var(--radius-lg) - 2px);
  padding:28px;
}
.dashboard-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
.dashboard-head-label{font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:rgba(144,224,214,.7);font-weight:600}
.dashboard-live{
  display:flex;align-items:center;gap:6px;
  font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;
  color:var(--teal);padding:4px 10px;border-radius:var(--radius-pill);
  border:1px solid rgba(0,189,170,.2);background:rgba(0,189,170,.08);
}
.dashboard-live .dot{width:5px;height:5px;border-radius:50%;background:var(--teal);animation:pulse 1.5s ease-in-out infinite}
.dashboard-balance{font-family:'Space Grotesk',sans-serif;font-size:36px;font-weight:700;letter-spacing:-.02em;margin-bottom:4px;color:#fff}
.dashboard-sub{font-size:11px;color:rgba(148,163,184,.6)}
.chart-row{display:flex;align-items:flex-end;gap:4px;height:64px;margin:20px 0;padding-bottom:12px;border-bottom:1px solid rgba(13,48,67,.4)}
.chart-bar{
  flex:1;border-radius:3px 3px 0 0;
  background:linear-gradient(to top,var(--teal-dk),var(--teal));
  min-height:4px;transition:all .3s var(--bounce);cursor:pointer;
}
.chart-bar:hover{transform:scaleX(1.08);opacity:.8}
.dashboard-metrics{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px}
.metric-card{
  padding:14px;border-radius:var(--radius-md);
  background:rgba(9,38,54,.5);border:1px solid rgba(0,189,170,.06);
  transition:all .3s var(--bounce);
}
.metric-card:hover{background:rgba(12,50,71,.5)}
.metric-label{font-size:9px;text-transform:uppercase;letter-spacing:.1em;color:rgba(148,163,184,.6);margin-bottom:4px}
.metric-value{font-family:'Space Grotesk',sans-serif;font-size:18px;font-weight:700}
.metric-value.green{color:#10B981}
.ledger-item{
  display:flex;align-items:center;justify-content:space-between;
  padding:12px;border-radius:var(--radius-sm);
  background:rgba(9,38,54,.35);border:1px solid rgba(0,189,170,.03);
  transition:all .3s var(--bounce);margin-bottom:8px;
}
.ledger-item:hover{transform:translateX(4px)}
.ledger-left{display:flex;align-items:center;gap:10px}
.ledger-icon{
  width:34px;height:34px;border-radius:var(--radius-sm);
  display:flex;align-items:center;justify-content:center;
  font-size:13px;font-weight:700;
}
.ledger-icon.red{background:rgba(225,29,72,.1);border:1px solid rgba(225,29,72,.15);color:#E11D48}
.ledger-icon.green{background:rgba(0,189,170,.1);border:1px solid rgba(0,189,170,.15);color:var(--teal)}
.ledger-name{font-size:12px;font-weight:600}
.ledger-desc{font-size:10px;color:rgba(148,163,184,.6)}
.ledger-amount{font-size:12px;font-weight:700;font-family:'Space Grotesk',sans-serif}
.ledger-amount.red{color:#E11D48}
.ledger-amount.green{color:#10B981}
/* ===== STATS STRIP ===== */
.stats-strip{
  margin-top:60px;padding:2px;border-radius:var(--radius-lg);
  background:linear-gradient(135deg,rgba(0,189,170,.08),transparent);
}
.stats-inner{
  background:var(--card);border-radius:calc(var(--radius-lg) - 2px);
  padding:28px 24px;
}
.stats-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:24px 16px}
@media(min-width:768px){.stats-grid{grid-template-columns:repeat(4,1fr)}}
.stat-item{text-align:center}
.stat-item+.stat-item{padding-top:16px;border-top:1px solid rgba(255,255,255,.04)}
@media(min-width:768px){.stat-item+.stat-item{padding-top:0;border-top:none;border-left:1px solid rgba(255,255,255,.04)}}
.stat-value{font-family:'Space Grotesk',sans-serif;font-size:28px;font-weight:600;letter-spacing:-.02em;margin-bottom:2px}
.stat-badge{
  display:inline-block;font-size:9px;font-weight:600;padding:2px 8px;border-radius:var(--radius-pill);
  background:rgba(0,189,170,.1);border:1px solid rgba(0,189,170,.2);color:var(--teal);
  margin-bottom:6px;
}
.stat-label{font-size:12px;color:var(--muted);font-weight:400}
/* ===== SERVICES ===== */
#services{position:relative}
#services::before{
  content:'';position:absolute;top:0;left:10%;right:10%;height:1px;
  background:linear-gradient(90deg,transparent,rgba(0,189,170,.15),transparent);
}
.services-grid{display:grid;gap:24px;grid-template-columns:1fr}
@media(min-width:768px){.services-grid{grid-template-columns:repeat(2,1fr)}}
@media(min-width:1024px){.services-grid{grid-template-columns:repeat(3,1fr)}}
.svc-card{
  padding:2px;border-radius:var(--radius-lg);
  background:linear-gradient(135deg,rgba(0,189,170,.06),rgba(255,255,255,.02));
  transition:all .5s var(--bounce);
  position:relative;overflow:hidden;
}
.svc-card:hover{background:linear-gradient(135deg,rgba(0,189,170,.12),rgba(255,255,255,.03));transform:translateY(-2px)}
.svc-inner{
  background:var(--card);border-radius:calc(var(--radius-lg) - 2px);
  padding:28px;height:100%;display:flex;flex-direction:column;
  box-shadow:inset 0 1px 1px rgba(255,255,255,.04);
}
.svc-icon{
  width:44px;height:44px;border-radius:var(--radius-sm);
  display:flex;align-items:center;justify-content:center;
  border:1px solid rgba(0,189,170,.15);background:rgba(0,189,170,.06);
  margin-bottom:20px;transition:all .4s var(--bounce);color:var(--teal);
}
.svc-card:hover .svc-icon{background:var(--teal);color:var(--navy)}
.svc-title{font-family:'Space Grotesk',sans-serif;font-size:17px;font-weight:600;margin-bottom:8px}
.svc-desc{font-size:13px;line-height:1.6;color:var(--muted);margin-bottom:16px;flex:1}
.svc-details{list-style:none;padding-top:16px;border-top:1px solid rgba(255,255,255,.04)}
.svc-details li{
  display:flex;align-items:center;gap:8px;
  font-size:12px;color:var(--muted);padding:4px 0;
}
.svc-details li svg{width:14px;height:14px;color:var(--teal);opacity:.6;flex-shrink:0}
.services-cta{display:flex;justify-content:center;margin-top:40px}
/* ===== HIGHLIGHTS ===== */
#highlights{position:relative}
#highlights::before{
  content:'';position:absolute;top:0;left:10%;right:10%;height:1px;
  background:linear-gradient(90deg,transparent,rgba(0,189,170,.15),transparent);
}
.pillars-grid{display:grid;gap:24px;margin-bottom:80px}
@media(min-width:768px){.pillars-grid{grid-template-columns:repeat(3,1fr)}}
.pillar-card{
  padding:2px;border-radius:var(--radius-lg);
  background:linear-gradient(135deg,rgba(0,189,170,.04),transparent);
  transition:all .5s var(--bounce);
}
.pillar-card:hover{background:linear-gradient(135deg,rgba(0,189,170,.1),transparent);transform:translateY(-3px)}
.pillar-inner{
  background:var(--card);border-radius:calc(var(--radius-lg) - 2px);
  padding:32px;display:flex;flex-direction:column;
  box-shadow:inset 0 1px 1px rgba(255,255,255,.04);
}
.pillar-icon{
  width:44px;height:44px;border-radius:var(--radius-sm);
  display:flex;align-items:center;justify-content:center;
  border:1px solid rgba(0,189,170,.12);background:rgba(0,189,170,.05);
  margin-bottom:20px;color:var(--teal);
}
.pillar-title{font-family:'Space Grotesk',sans-serif;font-size:18px;font-weight:600;margin-bottom:10px}
.pillar-desc{font-size:13px;line-height:1.7;color:var(--muted);margin-bottom:16px;flex:1}
.pillar-detail{
  font-size:11px;line-height:1.6;color:var(--sub);padding-top:16px;
  border-top:1px solid rgba(255,255,255,.04);
}
.pillar-detail-label{font-size:9px;text-transform:uppercase;letter-spacing:.12em;color:var(--teal-dk);font-weight:600;margin-bottom:4px}
/* ===== CTA ===== */
.cta-block{
  padding:2px;border-radius:var(--radius-lg);
  background:linear-gradient(135deg,rgba(0,189,170,.1),rgba(0,189,170,.02));
}
.cta-inner{
  background:linear-gradient(160deg,var(--card),var(--bg));
  border-radius:calc(var(--radius-lg) - 2px);
  padding:48px 32px;text-align:center;position:relative;overflow:hidden;
}
.cta-glow{
  position:absolute;top:-80px;right:-80px;width:300px;height:300px;
  border-radius:50%;background:rgba(0,189,170,.05);pointer-events:none;
}
.cta-title{font-family:'Space Grotesk',sans-serif;font-size:clamp(1.5rem,3vw,2.2rem);font-weight:700;margin-bottom:12px}
.cta-desc{font-size:14px;color:var(--muted);max-width:520px;margin:0 auto 28px;line-height:1.6}
.cta-form{display:flex;flex-direction:column;gap:10px;max-width:420px;margin:0 auto}
@media(min-width:480px){.cta-form{flex-direction:row}}
.cta-input-wrap{position:relative;flex:1}
.cta-input-wrap svg{
  position:absolute;left:14px;top:50%;transform:translateY(-50%);
  width:16px;height:16px;color:var(--sub);
}
.cta-input{
  width:100%;padding:12px 12px 12px 40px;border-radius:var(--radius-pill);
  border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.03);
  color:var(--text);font-size:13px;
  transition:all .3s var(--bounce);
  outline:none;
}
[data-theme="light"] .cta-input{background:rgba(0,0,0,.03);border-color:rgba(0,0,0,.08);color:var(--text)}
.cta-input:focus{border-color:var(--teal)}
.cta-success{
  display:flex;align-items:flex-start;gap:12px;text-align:left;max-width:480px;margin:0 auto;
  padding:16px;border-radius:var(--radius-md);
  background:rgba(0,189,170,.06);border:1px solid rgba(0,189,170,.15);
}
.cta-success svg{width:24px;height:24px;color:var(--teal);flex-shrink:0;margin-top:2px}
.cta-success p{font-size:13px;line-height:1.6;color:var(--muted)}
/* ===== FOOTER ===== */
footer{
  position:relative;padding:60px 0 32px;
}
footer::before{
  content:'';position:absolute;top:0;left:10%;right:10%;height:1px;
  background:linear-gradient(90deg,transparent,rgba(0,189,170,.15),transparent);
}
.footer-grid{display:grid;gap:40px;padding-bottom:40px;border-bottom:1px solid rgba(255,255,255,.04)}
@media(min-width:768px){.footer-grid{grid-template-columns:2fr 1fr 2fr}}
.footer-brand p{font-size:13px;line-height:1.7;color:var(--muted);margin-top:12px}
.footer-disclaimer{font-size:10.5px;line-height:1.6;color:var(--sub);margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,.04)}
.footer-col-title{font-size:10px;text-transform:uppercase;letter-spacing:.12em;font-weight:600;color:var(--teal);margin-bottom:16px}
.footer-links{list-style:none}
.footer-links li{margin-bottom:10px}
.footer-links a{
  display:flex;align-items:center;gap:8px;
  font-size:13px;color:var(--muted);
  transition:all .3s var(--bounce);
}
.footer-links a:hover{color:var(--teal);transform:translateX(4px)}
.footer-links .dot{
  width:5px;height:5px;border-radius:50%;
  background:var(--teal);opacity:.3;
  transition:all .3s var(--bounce);
}
.footer-links a:hover .dot{opacity:1;transform:scale(1.3)}
.contact-item{display:flex;align-items:flex-start;gap:12px;margin-bottom:14px}
.contact-icon{
  width:34px;height:34px;border-radius:var(--radius-sm);flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  border:1px solid rgba(0,189,170,.1);background:rgba(0,189,170,.04);color:var(--teal);
}
.contact-icon svg{width:15px;height:15px}
.contact-label{font-size:9px;text-transform:uppercase;letter-spacing:.06em;color:var(--sub);margin-bottom:2px}
.contact-value{font-size:13px;font-weight:600}
.contact-value a{transition:color .3s var(--bounce)}
.contact-value a:hover{color:var(--teal)}
.footer-bottom{
  display:flex;flex-direction:column;align-items:center;gap:20px;
  margin-top:32px;padding-top:24px;text-align:center;
}
@media(min-width:768px){.footer-bottom{flex-direction:row;justify-content:space-between}}
.footer-legal{display:flex;flex-wrap:wrap;gap:4px 16px;font-size:12px;color:var(--sub)}
.footer-legal span{cursor:pointer;transition:color .3s var(--bounce)}
.footer-legal span:hover{color:var(--teal)}
.footer-legal .sep{color:rgba(255,255,255,.06);cursor:default}
[data-theme="light"] .footer-legal .sep{color:rgba(0,0,0,.06)}
.footer-social{display:flex;align-items:center;gap:16px}
.footer-social-label{font-size:11px;color:var(--sub);font-weight:500}
.social-link{
  width:34px;height:34px;border-radius:var(--radius-sm);
  display:flex;align-items:center;justify-content:center;
  border:1px solid rgba(255,255,255,.04);color:var(--muted);
  transition:all .35s var(--bounce);
}
[data-theme="light"] .social-link{border-color:rgba(0,0,0,.06)}
.social-link:hover{color:var(--teal);border-color:rgba(0,189,170,.2);background:rgba(0,189,170,.04)}
.social-link svg{width:15px;height:15px}
.scroll-top{
  width:34px;height:34px;border-radius:var(--radius-sm);
  display:flex;align-items:center;justify-content:center;
  background:rgba(0,189,170,.1);color:var(--teal);
  transition:all .35s var(--bounce);
}
.scroll-top:hover{background:var(--teal);color:var(--navy);transform:translateY(-2px)}
/* ===== GRAIN OVERLAY ===== */
.grain-overlay{
  position:fixed;inset:0;z-index:9999;pointer-events:none;
  opacity:.035;mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-repeat:repeat;background-size:256px 256px;
}
[data-theme="light"] .grain-overlay{opacity:.02;mix-blend-mode:multiply}
/* ===== LOAD ENTRANCE ===== */
.load-fade{opacity:0;transform:translateY(24px);animation:loadIn .7s var(--bounce) forwards}
.load-fade-d1{animation-delay:.15s}
.load-fade-d2{animation-delay:.25s}
.load-fade-d3{animation-delay:.35s}
.load-fade-d4{animation-delay:.5s}
@keyframes loadIn{to{opacity:1;transform:translateY(0)}}
/* ===== REVEAL ANIMATIONS ===== */
.reveal{opacity:0;transform:translateY(60px);filter:blur(8px);transition:all 1s var(--bounce),filter 1s var(--bounce)}
.reveal.visible{opacity:1;transform:translateY(0);filter:blur(0)}
.reveal-d1{transition-delay:.1s}
.reveal-d2{transition-delay:.2s}
.reveal-d3{transition-delay:.3s}
.reveal-d4{transition-delay:.4s}
/* ===== ENHANCED HOVERS ===== */
.svc-card:hover .svc-inner{transform:scale(1.01)}
.svc-card::after{
  content:'';position:absolute;inset:-1px;border-radius:inherit;
  opacity:0;transition:opacity .5s var(--bounce);
  background:radial-gradient(600px circle at var(--mx,50%) var(--my,50%),rgba(0,189,170,.08),transparent 50%);
  pointer-events:none;z-index:0;
}
.svc-card:hover::after{opacity:1}
.pillar-card:hover .pillar-inner{transform:scale(1.015)}
.btn-primary:active{transform:scale(.97)}
/* ===== ACCESSIBILITY ===== */
@media(prefers-reduced-motion:reduce){
  *,.reveal,.nav-island,.btn-primary,.btn-secondary,.svc-card,.pillar-card,.dashboard-glow,.hero-tagline .dot,.dashboard-live .dot,.chart-bar,.nav-hamburger span,.nav-lang-slider,.nav-cta svg,.nav-cta,.scroll-top,.social-link,.nav-btn,.nav-links a,.nav-logo,.nav-hamburger,.mobile-overlay,.mobile-overlay a,.cta-input,.footer-links a,.footer-links .dot,.footer-legal span,.contact-value a,.metric-card,.ledger-item,.svc-icon,.svc-inner,.pillar-inner,.load-fade,.grain-overlay{transition:none!important;animation:none!important;transform:none!important;filter:none!important;opacity:1!important}
  .reveal,.load-fade{opacity:1!important;transform:none!important;filter:none!important}
  .dashboard-glow{animation:none!important}
  .grain-overlay{display:none}
}
button:focus-visible,a:focus-visible,.nav-btn:focus-visible,.nav-hamburger:focus-visible,.nav-links a:focus-visible,.nav-cta:focus-visible,.social-link:focus-visible,.scroll-top:focus-visible,.btn-primary:focus-visible,.btn-secondary:focus-visible{outline:2px solid var(--teal);outline-offset:2px}
/* ===== LANGUAGE ===== */
[data-lang] .lang-en,[data-lang="KH"] .lang-kh{display:var(--lang-display,block)}
[data-lang="EN"] .lang-kh,[data-lang="KH"] .lang-en{display:none !important}
/* ===== KHMER FONT ===== */
.lang-kh,.lang-kh *{font-family:'Noto Sans Khmer','Kantumruy Pro',sans-serif!important;letter-spacing:0px!important}
.lang-kh h1,.lang-kh h2,.lang-kh h3,.lang-kh h4{line-height:1.45!important}
.lang-kh p,.lang-kh span,.lang-kh a,.lang-kh button,.lang-kh li,.lang-kh label{line-height:1.7!important}
.lang-kh p,.lang-kh .text-base{font-size:1.05rem!important}
/* ===== RESPONSIVE ===== */
@media(max-width:767px){
  section{padding:60px 0}
  .dashboard-card{margin:0 -4px}
  .stat-value{font-size:24px}
  .cta-inner{padding:32px 20px}
  .footer-grid{grid-template-columns:1fr}
  .nav-btn,.nav-hamburger,.social-link,.scroll-top{min-width:44px;min-height:44px;width:44px;height:44px}
  .contact-icon{min-width:44px;min-height:44px;width:44px;height:44px}
}
/* ===== AMBIENT BG ===== */
.ambient-grid{
  position:absolute;inset:0;pointer-events:none;z-index:0;
  background-image:linear-gradient(rgba(0,189,170,.015) 1px,transparent 1px),linear-gradient(to right,rgba(0,189,170,.015) 1px,transparent 1px);
  background-size:48px 48px;
}
.ambient-glow-1{
  position:absolute;top:20%;left:15%;width:400px;height:400px;
  border-radius:50%;background:radial-gradient(circle,rgba(0,189,170,.05),transparent);
  pointer-events:none;filter:blur(80px);
}
.ambient-glow-2{
  position:absolute;bottom:10%;right:10%;width:500px;height:500px;
  border-radius:50%;background:radial-gradient(circle,rgba(0,189,170,.04),transparent);
  pointer-events:none;filter:blur(100px);
}
</style>
<?php wp_head(); ?>
</head>
<body>
<div class="grain-overlay"></div>

<!-- MOBILE OVERLAY -->
<div class="mobile-overlay" id="mobileOverlay">
  <a href="#hero" data-nav="hero" onclick="closeMobile();navigate('hero')"><span class="lang-en">Home</span><span class="lang-kh">ទំព័រដើម</span></a>
  <a href="#services" data-nav="services" onclick="closeMobile();navigate('services')"><span class="lang-en">Services</span><span class="lang-kh">សេវាកម្ម</span></a>
  <a href="#highlights" data-nav="highlights" onclick="closeMobile();navigate('highlights')"><span class="lang-en">Highlights</span><span class="lang-kh">លក្ខណៈពិសេស</span></a>
</div>

<!-- NAV -->
<nav class="nav-island" id="nav">
  <a href="#hero" class="nav-logo" onclick="navigate('hero')"><img src="<?php echo esc_url(get_stylesheet_directory_uri() . '/logo nexus finance.png'); ?>" alt="Nexusfinance" style="height:28px;width:auto;display:block"></a>
  <div class="nav-links">
    <a href="#hero" data-nav="hero" class="active"><span class="lang-en">Home</span><span class="lang-kh">ទំព័រដើម</span></a>
    <a href="#services" data-nav="services"><span class="lang-en">Services</span><span class="lang-kh">សេវាកម្ម</span></a>
    <a href="#highlights" data-nav="highlights"><span class="lang-en">Highlights</span><span class="lang-kh">លក្ខណៈពិសេស</span></a>
  </div>
  <div class="nav-actions">
    <button class="nav-btn" id="themeToggle" onclick="toggleTheme()" aria-label="Toggle theme">
      <span id="themeIcon">☀</span>
    </button>
    <div class="nav-lang" id="langToggle" data-lang="EN">
      <div class="nav-lang-slider"></div>
      <button onclick="setLang('EN')">EN</button>
      <button onclick="setLang('KH')">KH</button>
    </div>
    <button class="nav-cta" onclick="navigate('highlights')">
      <span class="lang-en">Get Started</span><span class="lang-kh">ចាប់ផ្តើម</span>
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3l5 5-5 5"/></svg>
    </button>
    <button class="nav-hamburger" id="hamburger" onclick="toggleMobile()" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>

<!-- HERO -->
<section id="hero">
  <div class="ambient-grid" aria-hidden="true"></div>
  <div class="ambient-glow-1" aria-hidden="true"></div>
  <div class="container" style="position:relative;z-index:1">
    <div class="hero-grid">
      <div>
        <div class="hero-tagline load-fade"><span class="dot"></span><span class="lang-en">All-in-One FinTech Ecosystem</span><span class="lang-kh">ប្រព័ន្ធបច្ចេកវិទ្យាហិរញ្ញវត្ថុរួមបញ្ចូលគ្នា</span></div>
        <h1 class="hero-title load-fade load-fade-d1">
          <span class="lang-en">Made Finance<br><em>Simple with You.</em></span>
          <span class="lang-kh">ធ្វើឱ្យហិរញ្ញវត្ថុ<br><em>កាន់តែសាមញ្ញជាមួយលោកអ្នក។</em></span>
        </h1>
        <p class="hero-desc load-fade load-fade-d2">
          <span class="lang-en">Nexusfinance unifies payments, lending, wallets, and analytics into one seamless platform, built for Southeast Asia's fast-growing digital economy.</span>
          <span class="lang-kh">Nexusfinance បញ្ចូលការបង់ប្រាក់ ការផ្តល់កម្ចី កាបូបលុយ និងប្រព័ន្ធវិភាគទៅក្នុងប្រព័ន្ធតែមួយ បង្កើតឡើងសម្រាប់សេដ្ឋកិច្ចឌីជីថលអាស៊ីអាគ្នេយ៍។</span>
        </p>
        <div class="hero-actions load-fade load-fade-d3">
          <button class="btn-primary" onclick="navigate('highlights')">
            <span class="lang-en">Get Started Free</span><span class="lang-kh">ចាប់ផ្តើមដោយសេរី</span>
            <span class="icon-wrap"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3l5 5-5 5"/></svg></span>
          </button>
          <button class="btn-secondary" onclick="navigate('services')">
            <span class="lang-en">Explore Products</span><span class="lang-kh">ស្វែងយល់ពីផលិតផល</span>
          </button>
        </div>
      </div>
      <div class="dashboard-wrap load-fade load-fade-d4">
        <div class="dashboard-glow"></div>
        <div class="dashboard-card">
          <div class="dashboard-inner">
            <div class="dashboard-head">
              <span class="dashboard-head-label"><span class="lang-en">Portfolio Overview</span><span class="lang-kh">ទិដ្ឋភាពទូទៅ</span></span>
              <span class="dashboard-live"><span class="dot"></span><span class="lang-en">Live</span><span class="lang-kh">បច្ចុប្បន្ន</span></span>
            </div>
            <div class="dashboard-balance">$48,290.50</div>
            <div class="dashboard-sub"><span class="lang-en">Total Balance · Updated just now</span><span class="lang-kh">សមតុល្យសរុប · ទើបធ្វើបច្ចុប្បន្នភាព</span></div>
            <div class="chart-row">
              <div class="chart-bar" style="height:30%"></div>
              <div class="chart-bar" style="height:48%"></div>
              <div class="chart-bar" style="height:26%"></div>
              <div class="chart-bar" style="height:62%"></div>
              <div class="chart-bar" style="height:38%"></div>
              <div class="chart-bar" style="height:78%"></div>
              <div class="chart-bar" style="height:70%"></div>
            </div>
            <div class="dashboard-metrics">
              <div class="metric-card">
                <div class="metric-label"><span class="lang-en">Monthly Growth</span><span class="lang-kh">កំណើនប្រចាំខែ</span></div>
                <div class="metric-value green">+12.4%</div>
              </div>
              <div class="metric-card">
                <div class="metric-label"><span class="lang-en">Active Loans</span><span class="lang-kh">កម្ចីសកម្ម</span></div>
                <div class="metric-value" style="color:var(--teal)">24</div>
              </div>
            </div>
            <div class="ledger-item">
              <div class="ledger-left">
                <div class="ledger-icon red">⇄</div>
                <div>
                  <div class="ledger-name"><span class="lang-en">Transfer</span><span class="lang-kh">ផ្ទេរប្រាក់</span></div>
                  <div class="ledger-desc"><span class="lang-en">To Sokha Retail</span><span class="lang-kh">ទៅកាន់ សុខា លក់រាយ</span></div>
                </div>
              </div>
              <div class="ledger-amount red">-$1,200</div>
            </div>
            <div class="ledger-item">
              <div class="ledger-left">
                <div class="ledger-icon green">⇡</div>
                <div>
                  <div class="ledger-name"><span class="lang-en">Investment</span><span class="lang-kh">ការវិនិយោគ</span></div>
                  <div class="ledger-desc"><span class="lang-en">Fixed Return Plan</span><span class="lang-kh">គម្រោងការត្រឡប់ថេរ</span></div>
                </div>
              </div>
              <div class="ledger-amount green">+$850</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="stats-strip load-fade load-fade-d4">
      <div class="stats-inner">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">2,450+</div>
            <div class="stat-badge">+18% YoY</div>
            <div class="stat-label"><span class="lang-en">Active Enterprise Partners</span><span class="lang-kh">ដៃគូសហគ្រាសសកម្ម</span></div>
          </div>
          <div class="stat-item">
            <div class="stat-value">$120M+</div>
            <div class="stat-badge">100% Secure</div>
            <div class="stat-label"><span class="lang-en">Total Capital Processed</span><span class="lang-kh">ទុនកម្ចីសរុប</span></div>
          </div>
          <div class="stat-item">
            <div class="stat-value">99.99%</div>
            <div class="stat-badge">Optimal</div>
            <div class="stat-label"><span class="lang-en">Average Platform Uptime</span><span class="lang-kh">អត្រាដំណើរការប្រព័ន្ធ</span></div>
          </div>
          <div class="stat-item">
            <div class="stat-value">94.2%</div>
            <div class="stat-badge">Industry Top</div>
            <div class="stat-label"><span class="lang-en">User Retention Rate</span><span class="lang-kh">អត្រារក្សាទុកអ្នកប្រើ</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- SERVICES -->
<section id="services">
  <div class="ambient-grid" aria-hidden="true"></div>
  <div class="ambient-glow-2" aria-hidden="true"></div>
  <div class="container" style="position:relative;z-index:1">
    <div class="reveal" style="max-width:640px;margin-bottom:48px">
      <div class="section-badge">
        <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 1v14M1 8h14"/></svg>
        <span class="lang-en">Integrated FinTech Suite</span><span class="lang-kh">កញ្ចប់សេវាកម្មហិរញ្ញវត្ថុរួមគ្នា</span>
      </div>
      <h2 style="font-family:'Space Grotesk',sans-serif;font-size:clamp(1.6rem,3.5vw,2.5rem);font-weight:700;letter-spacing:-.02em;line-height:1.1">
        <span class="lang-en">Everything Finance, One Ecosystem</span>
        <span class="lang-kh">ដៃគូរតែមួយ។ គ្រប់ដំណោះស្រាយ។</span>
      </h2>
      <div style="width:60px;height:4px;background:var(--teal);border-radius:4px;margin:16px 0"></div>
      <p style="font-size:14px;line-height:1.7;color:var(--muted);margin-top:12px">
        <span class="lang-en">Simplify your operational workflows with our robust, end-to-end financial modules designed for the modern Southeast Asian digital economy.</span>
        <span class="lang-kh">សម្រួលប្រតិបត្តិការការងាររបស់អ្នកជាមួយនឹងម៉ូឌុលហិរញ្ញវត្ថុដ៏រឹងមាំ សម្រាប់សេដ្ឋកិច្ចឌីជីថលអាស៊ីអាគ្នេយ៍។</span>
      </p>
    </div>
    <div class="services-grid">
      <!-- Digital Wallet -->
      <div class="svc-card reveal">
        <div class="svc-inner">
          <div class="svc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="22" height="22"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg></div>
          <div class="svc-title"><span class="lang-en">Digital Wallet</span><span class="lang-kh">កាបូបលុយឌីជីថល</span></div>
          <div class="svc-desc"><span class="lang-en">Secure e-wallets, peer-to-peer transfers, and instant account synchronization supporting multiple regional currencies.</span><span class="lang-kh">ប្រព័ន្ធ e-wallets ប្រកបដោយសុវត្ថិភាព ការផ្ទេរប្រាក់រហ័ស គាំទ្រច្រើនរូបិយប័ណ្ណ។</span></div>
          <ul class="svc-details">
            <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg><span class="lang-en">Multi-currency support</span><span class="lang-kh">គាំទ្រច្រើនរូបិយប័ណ្ណ</span></li>
            <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg><span class="lang-en">Instant P2P transactions</span><span class="lang-kh">ការផ្ទេរប្រាក់រហ័ស</span></li>
            <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg><span class="lang-en">Encrypted local ledger tracking</span><span class="lang-kh">ការកត់ត្រាគណនេយ្យមានសុវត្ថិភាព</span></li>
          </ul>
        </div>
      </div>
      <!-- Business Lending -->
       <div class="svc-card reveal reveal-d1">
          <div class="svc-inner">
            <div class="svc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="22" height="22"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg></div>
            <div class="svc-title"><span class="lang-en">Business Lending</span><span class="lang-kh">ការផ្តល់កម្ចីអាជីវកម្ម</span></div>
          <div class="svc-desc"><span class="lang-en">Flexible business loan management platforms with built-in credit underwriting classifiers and repayment trackers.</span><span class="lang-kh">កម្ចីអាជីវកម្ម ជាមួយប្រព័ន្ធវិភាគលទ្ធភាពសងត្រឡប់ និងតារាងកាលវិភាគ។</span></div>
          <ul class="svc-details">
            <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg><span class="lang-en">Dynamic risk assessment</span><span class="lang-kh">វាយតម្លៃហានិភ័យរហ័ស</span></li>
            <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg><span class="lang-en">Automated approval pipeline</span><span class="lang-kh">ប្រព័ន្ធអនុម័តស្វ័យប្រវត្ត</span></li>
            <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg><span class="lang-en">Flexible schedule builders</span><span class="lang-kh">រៀបចំផែនការបង់ប្រាក់បត់បែន</span></li>
          </ul>
        </div>
      </div>
      <!-- Payment Gateway -->
      <div class="svc-card reveal reveal-d2">
        <div class="svc-inner">
          <div class="svc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="22" height="22"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg></div>
          <div class="svc-title"><span class="lang-en">Payment Gateway</span><span class="lang-kh">ច្រកទូទាត់ប្រាក់</span></div>
          <div class="svc-desc"><span class="lang-en">Seamless checkout widgets, regional mobile QR code handlers, and merchant payout settle-up rails.</span><span class="lang-kh">ការទូទាត់តាម QR កូដក្នុងតំបន់ និងប្រព័ន្ធទូទាត់សម្រាប់អាជីវករ។</span></div>
          <ul class="svc-details">
            <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg><span class="lang-en">Local QR codes &amp; banks</span><span class="lang-kh">ស្កេន QR កូដក្នុងស្រុក</span></li>
            <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg><span class="lang-en">99.99% transaction success rate</span><span class="lang-kh">ធានាអត្រាជោគជ័យខ្ពស់</span></li>
            <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg><span class="lang-en">Instant checkout widgets</span><span class="lang-kh">ការតភ្ជាប់ងាយស្រួល</span></li>
          </ul>
        </div>
      </div>
      <!-- Analytics Dashboard -->
      <div class="svc-card  reveal reveal-d3">
        <div class="svc-inner">
          <div class="svc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="22" height="22"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></div>
          <div class="svc-title"><span class="lang-en">Analytics Dashboard</span><span class="lang-kh">ផ្ទាំងវិភាគទិន្នន័យ</span></div>
          <div class="svc-desc"><span class="lang-en">Multi-dimensional risk analysis platforms, real-time performance graphics, and compliance indicators.</span><span class="lang-kh">ការវិភាគហានិភ័យពហុវិមាត្រ គំនូសតាងពេលវេលាពិត និងរបាយការណ៍។</span></div>
          <ul class="svc-details">
            <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg><span class="lang-en">Interactive dynamic visuals</span><span class="lang-kh">គំនូសតាងទិន្នន័យសកម្ម</span></li>
            <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg><span class="lang-en">Predictive loan risk indicators</span><span class="lang-kh">បង្ហាញសូចនាករហានិភ័យ</span></li>
            <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg><span class="lang-en">Exportable audit-ready logs</span><span class="lang-kh">របាយការណ៍សវនកម្ម</span></li>
          </ul>
        </div>
      </div>
      <!-- Payroll & HR Finance -->
      <div class="svc-card  reveal reveal-d4">
        <div class="svc-inner">
          <div class="svc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="22" height="22"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg></div>
          <div class="svc-title"><span class="lang-en">Payroll &amp; HR Finance</span><span class="lang-kh">ប្រព័ន្ធបើកប្រាក់បៀវត្សរ៍</span></div>
          <div class="svc-desc"><span class="lang-en">Streamlined staff payroll systems, employee commission handlers, tax calculators, and business expense widgets.</span><span class="lang-kh">សម្រួលការបើកប្រាក់បៀវត្សរ៍ គណនាប្រាក់កម្រៃជើងសារ និងពន្ធកាត់ទុក។</span></div>
          <ul class="svc-details">
            <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg><span class="lang-en">One-click payroll disbursement</span><span class="lang-kh">បើកប្រាក់បៀវត្សរ៍មួយចុច</span></li>
            <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg><span class="lang-en">Custom commission calculators</span><span class="lang-kh">គណនាប្រាក់កម្រៃជើងសារ</span></li>
            <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg><span class="lang-en">Automated tax withholding</span><span class="lang-kh">គណនាពន្ធកាត់ទុក</span></li>
          </ul>
        </div>
      </div>
      <!-- Compliance & KYC -->
      <div class="svc-card  reveal reveal-d3">
        <div class="svc-inner">
          <div class="svc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="22" height="22"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
          <div class="svc-title"><span class="lang-en">Compliance &amp; KYC</span><span class="lang-kh">អនុលោមភាព &amp; KYC</span></div>
          <div class="svc-desc"><span class="lang-en">Automated document checks, secure digital identity handshakes, and strict anti-fraud protection shields.</span><span class="lang-kh">ការផ្ទៀងផ្ទាត់ឯកសារស្វ័យប្រវត្ត ការចុះហត្ថលេខាឌីជីថល និងការពារការក្លែងបន្លំ។</span></div>
          <ul class="svc-details">
            <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg><span class="lang-en">Automated e-KYC filters</span><span class="lang-kh">ប្រព័ន្ធ e-KYC ស្វ័យប្រវត្ត</span></li>
            <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg><span class="lang-en">Identity authentication rules</span><span class="lang-kh">ផ្ទៀងផ្ទាត់អត្តសញ្ញាណ</span></li>
            <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg><span class="lang-en">Regional AML check lists</span><span class="lang-kh">ត្រួតពិនិត្យប្រឆាំងលាងលុយ</span></li>
          </ul>
        </div>
      </div>
    </div>
    <div class="services-cta reveal">
      <button class="btn-secondary" onclick="navigate('highlights')" style="padding:10px 28px;font-size:12px;letter-spacing:.06em">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px"><path d="M8 1v14M1 8h14"/></svg>
        <span class="lang-en">Learn More About the Ecosystem</span><span class="lang-kh">ស្វែងយល់បន្ថែម</span>
      </button>
    </div>
  </div>
</section>

<!-- HIGHLIGHTS -->
<section id="highlights">
  <div class="ambient-grid" aria-hidden="true"></div>
  <div aria-hidden="true" style="position:absolute;bottom:0;left:0;right:0;height:300px;background:linear-gradient(to top,rgba(0,189,170,.03),transparent);pointer-events:none"></div>
  <div class="container" style="position:relative;z-index:1">
    <div class="reveal" style="text-align:center;max-width:600px;margin:0 auto 48px">
      <div class="section-badge" style="margin-left:auto;margin-right:auto">
        <span class="lang-en">Our Platform Pillars</span><span class="lang-kh">សសរស្ដម្ភនៃប្រព័ន្ធ</span>
      </div>
      <h2 style="font-family:'Space Grotesk',sans-serif;font-size:clamp(1.5rem,3vw,2.2rem);font-weight:700;letter-spacing:-.02em">
        <span class="lang-en">Engineered for Performance and Compliant Growth</span>
        <span class="lang-kh">រចនាឡើងសម្រាប់ប្រសិទ្ធភាព និងកំណើនរឹងមាំ</span>
      </h2>
      <div style="width:50px;height:4px;background:linear-gradient(to right,var(--teal),var(--teal-md));border-radius:4px;margin:16px auto 0"></div>
    </div>
    <div class="pillars-grid">
      <div class="pillar-card reveal">
        <div class="pillar-inner">
          <div class="pillar-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
          <div class="pillar-title"><span class="lang-en">Up &amp; Running in Minutes</span><span class="lang-kh">តម្លើង និងដំណើរការក្នុងរយៈពេលខ្លី</span></div>
          <div class="pillar-desc"><span class="lang-en">Instant developer sandboxes, accessible endpoints, and streamlined deployment. Minimize integration overhead and launch financial features faster.</span><span class="lang-kh">ការតភ្ជាប់ងាយស្រួល ប្រព័ន្ធគំរូសាកល្បងភ្លាមៗ និងការដាក់ឱ្យប្រើប្រាស់រហ័ស។</span></div>
          <div class="pillar-detail">
            <div class="pillar-detail-label"><span class="lang-en">Functional Highlight</span><span class="lang-kh">ចំណុចសំខាន់</span></div>
            <span class="lang-en">Zero down setup, clean sandbox keys, and real-time live-testing telemetry.</span>
            <span class="lang-kh">ការកំណត់លឿន គំរូសាកល្បងឥតគិតថ្លៃ និងការធ្វើតេស្តពេលវេលាពិត។</span>
          </div>
        </div>
      </div>
      <div class="pillar-card reveal reveal-d1">
        <div class="pillar-inner">
          <div class="pillar-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg></div>
          <div class="pillar-title"><span class="lang-en">Built for Southeast Asia</span><span class="lang-kh">បង្កើតឡើងសម្រាប់អាស៊ីអាគ្នេយ៍</span></div>
          <div class="pillar-desc"><span class="lang-en">Tailored specifically for regional operations, multi-currency balance ledgers, and national regulatory directives.</span><span class="lang-kh">រៀបចំឡើងសម្រាប់ប្រតិបត្តិការក្នុងតំបន់ គាំទ្រសមតុល្យពហុរូបិយប័ណ្ណ និងបទប្បញ្ញត្តិក្នុងស្រុក។</span></div>
          <div class="pillar-detail">
            <div class="pillar-detail-label"><span class="lang-en">Functional Highlight</span><span class="lang-kh">ចំណុចសំខាន់</span></div>
            <span class="lang-en">Direct integrations with commercial regional networks and microfinance compliant templates.</span>
            <span class="lang-kh">ការតភ្ជាប់ផ្ទាល់ជាមួយប្រព័ន្ធធនាគារក្នុងស្រុក និងការអនុលោមតាមស្ដង់ដារ។</span>
          </div>
        </div>
      </div>
      <div class="pillar-card reveal reveal-d2">
        <div class="pillar-inner">
          <div class="pillar-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
          <div class="pillar-title"><span class="lang-en">Trusted by Businesses</span><span class="lang-kh">ទទួលបានការទុកចិត្តពីអាជីវកម្ម</span></div>
          <div class="pillar-desc"><span class="lang-en">High-availability infrastructure ensuring 99.99% system uptime, robust backup networks, and bank-level secure tokens.</span><span class="lang-kh">ហេដ្ឋារចនាសម្ព័ន្ធធានាអត្រាដំណើរការ ៩៩.៩៩% ប្រព័ន្ធបម្រុងទិន្នន័យរឹងមាំ សុវត្ថិភាពកម្រិតធនាគារ។</span></div>
          <div class="pillar-detail">
            <div class="pillar-detail-label"><span class="lang-en">Functional Highlight</span><span class="lang-kh">ចំណុចសំខាន់</span></div>
            <span class="lang-en">Enterprise identity security, secure automated document filters, and periodic cold-storage snapshots.</span>
            <span class="lang-kh">ប្រព័ន្ធគ្រប់គ្រងសន្តិសុខអត្តសញ្ញាណ ការត្រួតពិនិត្យឯកសារស្វ័យប្រវត្ត និងការបម្រុងទុកជាប្រចាំ។</span>
          </div>
        </div>
      </div>
    </div>
    <!-- CTA -->
    <div class="cta-block reveal">
      <div class="cta-inner">
        <div class="cta-glow" aria-hidden="true"></div>
        <div style="position:relative;z-index:1">
          <div class="section-badge" style="margin-left:auto;margin-right:auto;margin-bottom:16px">
            <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px"><path d="M8 1v14M1 8h14"/></svg>
            <span class="lang-en">Get Access</span><span class="lang-kh">ទទួលបានសិទ្ធិចូលប្រើ</span>
          </div>
          <h3 class="cta-title">
            <span class="lang-en">Ready to Simplify Your Finance?</span>
            <span class="lang-kh">ត្រៀមខ្លួនសម្រួលហិរញ្ញវត្ថុរបស់អ្នកហើយឬនៅ?</span>
          </h3>
          <p class="cta-desc">
            <span class="lang-en">Enter your business email address for instant access to our sandbox environment and operational guides.</span>
            <span class="lang-kh">បញ្ចូលអ៊ីមែលអាជីវកម្មរបស់អ្នក ដើម្បីទទួលបានការចូលទៅកាន់គំរូសាកល្បងប្រព័ន្ធ និងសៀវភៅណែនាំ។</span>
          </p>
          <div id="ctaFormWrap">
            <form class="cta-form" id="ctaForm">
              <div class="cta-input-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input class="cta-input" type="email" id="ctaEmail" required placeholder="" autocomplete="email">
              </div>
              <button class="btn-primary" type="submit" style="padding:12px 28px;font-size:12px;white-space:nowrap">
                <span class="lang-en">Start Simple</span><span class="lang-kh">ចាប់ផ្តើមភ្លាមៗ</span>
                <span class="icon-wrap"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3l5 5-5 5"/></svg></span>
              </button>
            </form>
          </div>
          <p style="font-size:11px;color:var(--sub);margin-top:8px">
            <span class="lang-en">Placeholder for CTA email: no submission endpoint configured</span>
            <span class="lang-kh">កន្លែងដាក់អ៊ីមែល: មិនទាន់កំណត់រចនាសម្ព័ន្ធ</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer>
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="#hero" onclick="navigate('hero')"><img src="<?php echo esc_url(get_stylesheet_directory_uri() . '/logo nexus finance.png'); ?>" alt="Nexusfinance" style="height:32px;width:auto;display:block"></a>
        <p>
          <span class="lang-en">We connect strategy, technology and people to simplify lending operations and build a stronger financial future together.</span>
          <span class="lang-kh">យើងភ្ជាប់យុទ្ធសាស្ត្រ បច្ចេកវិទ្យា និងមនុស្ស ដើម្បីសម្រួលប្រតិបត្តិការហិរញ្ញវត្ថុ និងរួមគ្នាបង្កើតអនាគតដ៏រឹងមាំ។</span>
        </p>
        <div class="footer-disclaimer">
          <span class="lang-en">Nexusfinance limits services strictly to professional license holders, business consultations, and enterprise software provisioning. All loans disbursed correspond to legal licensed lending entities.</span>
          <span class="lang-kh">Nexusfinance កំណត់សេវាកម្មត្រឹមការពិគ្រោះយោបល់អាជីវកម្ម និងការផ្តល់ជូនកម្មវិធីទន់ហិរញ្ញវត្ថុដល់សហគ្រាសស្របច្បាប់ប៉ុណ្ណោះ។</span>
        </div>
      </div>
      <div>
        <div class="footer-col-title"><span class="lang-en">Navigation</span><span class="lang-kh">មាតិកា</span></div>
        <ul class="footer-links">
          <li><a href="#hero" onclick="navigate('hero')"><span class="dot"></span><span class="lang-en">Overview Profile</span><span class="lang-kh">ទំព័រដើម</span></a></li>
          <li><a href="#services" onclick="navigate('services')"><span class="dot"></span><span class="lang-en">Core FinTech Services</span><span class="lang-kh">សេវាកម្មចម្បង</span></a></li>
          <li><a href="#highlights" onclick="navigate('highlights')"><span class="dot"></span><span class="lang-en">Platform Highlights</span><span class="lang-kh">លក្ខណៈពិសេស</span></a></li>
        </ul>
      </div>
      <div>
        <div class="footer-col-title"><span class="lang-en">Ecosystem Key Contacts</span><span class="lang-kh">ព័ត៌មានទំនាក់ទំនង</span></div>
        <div class="contact-item">
          <div class="contact-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg></div>
          <div>
            <div class="contact-label">Main Office Line</div>
            <div class="contact-value"><a href="tel:+85581311033">+855 81 311 033</a></div>
          </div>
        </div>
        <div class="contact-item">
          <div class="contact-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div>
          <div>
            <div class="contact-label">Corporate Secretariat</div>
            <div class="contact-value"><a href="mailto:info@nexusfinance.asia">info@nexusfinance.asia</a></div>
          </div>
        </div>
        <div class="contact-item">
          <div class="contact-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg></div>
          <div>
            <div class="contact-label">Web Portal URL</div>
            <div class="contact-value"><a href="https://www.nexusfinance.asia" target="_blank" rel="noopener">www.nexusfinance.asia</a></div>
          </div>
        </div>
        <div class="contact-item">
          <div class="contact-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
          <div>
            <div class="contact-label">Regional Office</div>
            <div class="contact-value">Phnom Penh, Cambodia</div>
          </div>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="footer-legal">
        <span>&copy; <span id="year"></span> Nexusfinance Co., Ltd. <span class="lang-en">All rights reserved.</span><span class="lang-kh">រក្សាសិទ្ធិគ្រប់យ៉ាង។</span></span>
        <span class="sep">|</span>
        <span class="lang-en">Privacy Policy</span><span class="lang-kh">គោលការណ៍ឯកជនភាព</span>
        <span class="sep">|</span>
        <span class="lang-en">Service Level Terms</span><span class="lang-kh">លក្ខខណ្ឌសេវាកម្ម</span>
      </div>
      <div class="footer-social">
        <span class="footer-social-label"><span class="lang-en">Follow Us</span><span class="lang-kh">តាមដានយើង</span></span>
        <a href="https://t.me" target="_blank" rel="noopener" class="social-link" aria-label="Telegram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 11 9 14 20 4"/><path d="M20 4l-9 16-3-7-7-3z"/></svg></a>
        <a href="https://facebook.com" target="_blank" rel="noopener" class="social-link" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg></a>
        <a href="https://linkedin.com" target="_blank" rel="noopener" class="social-link" aria-label="LinkedIn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg></a>
        <button class="scroll-top" onclick="scrollToTop()" aria-label="Scroll to top"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg></button>
      </div>
    </div>
  </div>
</footer>

<script>
let currentLang = localStorage.getItem('nexusfin_lang') || 'EN';
let currentTheme = localStorage.getItem('nexusfin_theme') || 'dark';
let isMobileOpen = false;

document.documentElement.setAttribute('data-theme', currentTheme);
document.documentElement.setAttribute('data-lang', currentLang);
document.getElementById('year').textContent = new Date().getFullYear();
document.getElementById('themeIcon').textContent = currentTheme === 'dark' ? '☀' : '☾';
document.getElementById('langToggle').setAttribute('data-lang', currentLang);

// Keep lang label on input placeholder in sync
const input = document.getElementById('ctaEmail');
function updatePlaceholder() {
  input.placeholder = currentLang === 'EN' ? 'Enter your corporate email' : 'បញ្ចូលអ៊ីមែលអាជីវកម្មរបស់អ្នក';
}
updatePlaceholder();

function setLang(l) {
  currentLang = l;
  localStorage.setItem('nexusfin_lang', l);
  document.documentElement.setAttribute('data-lang', l);
  document.getElementById('langToggle').setAttribute('data-lang', l);
  updatePlaceholder();
}

function toggleTheme() {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('nexusfin_theme', currentTheme);
  document.documentElement.setAttribute('data-theme', currentTheme);
  document.getElementById('themeIcon').textContent = currentTheme === 'dark' ? '☀' : '☾';
}

function toggleMobile() {
  isMobileOpen = !isMobileOpen;
  document.getElementById('mobileOverlay').classList.toggle('open');
  document.getElementById('hamburger').classList.toggle('open');
  document.body.style.overflow = isMobileOpen ? 'hidden' : '';
}

function closeMobile() {
  isMobileOpen = false;
  document.getElementById('mobileOverlay').classList.remove('open');
  document.getElementById('hamburger').classList.remove('open');
  document.body.style.overflow = '';
}

function navigate(id) {
  const el = document.getElementById(id);
  if (el) {
    const offset = 100;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
  closeMobile();
  // Update active nav
  document.querySelectorAll('[data-nav]').forEach(a => a.classList.remove('active'));
  document.querySelectorAll('[data-nav="' + id + '"]').forEach(a => a.classList.add('active'));
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.querySelectorAll('[data-nav]').forEach(a => a.classList.remove('active'));
  document.querySelectorAll('[data-nav="hero"]').forEach(a => a.classList.add('active'));
}

// IntersectionObserver for reveals
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Nav scroll effect
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const nav = document.getElementById('nav');
  const y = window.scrollY;
  if (y > 40) { nav.classList.add('scrolled'); } else { nav.classList.remove('scrolled'); }

  // Active section tracking
  const sections = ['hero', 'services', 'highlights'];
  let current = 'hero';
  const offset = 150;
  for (const id of sections) {
    const el = document.getElementById(id);
    if (el && el.offsetTop - offset <= y) { current = id; }
  }
  document.querySelectorAll('[data-nav]').forEach(a => a.classList.remove('active'));
  document.querySelectorAll('[data-nav="' + current + '"]').forEach(a => a.classList.add('active'));

  lastScroll = y;
});

// CTA form
document.getElementById('ctaForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const email = document.getElementById('ctaEmail').value.trim();
  if (!email) return;
  const wrap = document.getElementById('ctaFormWrap');
  wrap.innerHTML = `<div class="cta-success">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
    <p><span class="lang-en">Thank you! Our Secretariat will send your sandbox environment keys within 24 hours.</span><span class="lang-kh">សូមអរគុណ! ក្រុមការងារនឹងផ្ញើកូនសោគំរូសាកល្បងទៅកាន់អ៊ីមែលរបស់អ្នកក្នុងរយៈពេល ២៤ ម៉ោង។</span></p>
  </div>`;
});

// Mouse spotlight on service cards
document.querySelectorAll('.svc-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
    card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
  });
});

// Handle hash navigation on load
if (window.location.hash) {
  const id = window.location.hash.replace('#', '');
  setTimeout(() => navigate(id), 100);
}
<?php wp_footer(); ?>
</script>
</body>
</html>
