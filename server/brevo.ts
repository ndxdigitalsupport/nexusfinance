import dotenv from 'dotenv';
dotenv.config();

const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'ndxdigitalsupport@gmail.com';
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || 'Nexus Finance';

const brevoEnabled = !!BREVO_API_KEY;

export async function sendBrevoEmail(to: string, subject: string, html: string) {
  if (!brevoEnabled) {
    console.log(`\n  📧 Brevo email not sent (BREVO_API_KEY missing): ${subject} -> ${to}`);
    console.log(`  └─ HTML body: ${html.slice(0, 200)}...`);
    return { success: false, info: 'Brevo not configured. Email logged to console.' };
  }
  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: BREVO_SENDER_NAME, email: BREVO_SENDER_EMAIL },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error(`  📧 Brevo email failed: ${subject} -> ${to} (${res.status}): ${text.slice(0, 300)}`);
      return { success: false, error: `${res.status} ${text}` };
    }
    const data = await res.json();
    console.log(`  📧 Brevo email sent: ${subject} -> ${to} (id: ${data.messageId})`);
    return { success: true, messageId: data.messageId };
  } catch (err) {
    console.error(`  📧 Brevo email send error: ${subject} -> ${to}`, err);
    return { success: false, error: String(err) };
  }
}

export async function sendOtpEmail(to: string, otp: string) {
  const subject = 'NexusFinance — Your verification code';
  const html = `<div style="font-family:system-ui,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#f4faf8;border-radius:16px;">
    <div style="text-align:center;margin-bottom:16px;">
      <span style="font-size:20px;font-weight:800;color:#0f172a;">Nexus<span style="color:#00BDAA;font-weight:400;">Finance</span></span>
    </div>
    <div style="background:#ffffff;border-radius:12px;padding:24px;border:1px solid #e2ecea;">
      <h2 style="font-size:18px;color:#0f172a;margin:0 0 8px;">Verification Code</h2>
      <p style="color:#64748b;font-size:14px;line-height:1.5;margin:0 0 16px;">Use the 6-digit code below to verify your email. This code expires in <strong>10 minutes</strong>.</p>
      <div style="background:#e6f7f4;border:2px dashed #00BDAA;border-radius:10px;padding:16px;text-align:center;">
        <span style="font-size:30px;font-weight:800;letter-spacing:8px;color:#00BDAA;font-family:monospace;">${otp}</span>
      </div>
      <p style="color:#94a3b8;font-size:12px;line-height:1.5;margin:16px 0 0;">If you did not request this code, you can safely ignore this email.</p>
    </div>
    <p style="color:#94a3b8;font-size:12px;text-align:center;margin:16px 0 0;">NexusFinance — Smart Lending Platform</p>
  </div>`;
  return sendBrevoEmail(to, subject, html);
}
