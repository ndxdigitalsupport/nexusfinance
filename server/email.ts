import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`\n  📧 Email not sent (SMTP not configured): ${subject} -> ${to}`);
    console.log(`  └─ HTML body: ${html.slice(0, 200)}...`);
    return { success: false, info: 'SMTP not configured. Email logged to console.' };
  }
  try {
    const info = await transporter.sendMail({
      from: `"NexusFinance" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`  📧 Email sent: ${subject} -> ${to} (id: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`  📧 Email send failed: ${subject} -> ${to}`, err);
    return { success: false, error: String(err) };
  }
}

export const emailTemplates = {
  passwordReset: (name: string, email: string) => ({
    subject: 'NexusFinance — Password Reset',
    html: `<div style="font-family:system-ui;max-width:480px;margin:0 auto;padding:24px;">
      <h2 style="font-size:20px;margin:0 0 8px;">Password Reset</h2>
      <p style="color:#555;font-size:14px;line-height:1.5;">Hi ${name},<br/>A password reset was requested for your NexusFinance account (<strong>${email}</strong>).</p>
      <p style="color:#555;font-size:14px;line-height:1.5;">If you did not request this, please ignore this email. Otherwise, contact your administrator to complete the reset.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;"/>
      <p style="color:#999;font-size:12px;">NexusFinance — Smart Lending Platform</p>
    </div>`,
  }),
  loanApproved: (name: string, loanId: string, amount: number) => ({
    subject: `NexusFinance — Loan ${loanId} Approved`,
    html: `<div style="font-family:system-ui;max-width:480px;margin:0 auto;padding:24px;">
      <h2 style="font-size:20px;margin:0 0 8px;">Loan Approved ✓</h2>
      <p style="color:#555;font-size:14px;line-height:1.5;">Hi ${name},</p>
      <p style="color:#555;font-size:14px;line-height:1.5;">Your loan <strong>${loanId}</strong> for <strong>$${amount.toLocaleString()}</strong> has been <span style="color:#059669;font-weight:600;">approved</span> and disbursed.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;"/>
      <p style="color:#999;font-size:12px;">NexusFinance — Smart Lending Platform</p>
    </div>`,
  }),
  loanRejected: (name: string, loanId: string) => ({
    subject: `NexusFinance — Loan ${loanId} Status Update`,
    html: `<div style="font-family:system-ui;max-width:480px;margin:0 auto;padding:24px;">
      <h2 style="font-size:20px;margin:0 0 8px;">Loan Application Update</h2>
      <p style="color:#555;font-size:14px;line-height:1.5;">Hi ${name},</p>
      <p style="color:#555;font-size:14px;line-height:1.5;">Your loan application <strong>${loanId}</strong> has been <span style="color:#dc2626;font-weight:600;">rejected</span>.</p>
      <p style="color:#555;font-size:14px;line-height:1.5;">Please contact support for more information.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;"/>
      <p style="color:#999;font-size:12px;">NexusFinance — Smart Lending Platform</p>
    </div>`,
  }),
  roleChanged: (name: string, newRole: string) => ({
    subject: 'NexusFinance — Account Role Updated',
    html: `<div style="font-family:system-ui;max-width:480px;margin:0 auto;padding:24px;">
      <h2 style="font-size:20px;margin:0 0 8px;">Role Updated</h2>
      <p style="color:#555;font-size:14px;line-height:1.5;">Hi ${name},</p>
      <p style="color:#555;font-size:14px;line-height:1.5;">Your account role has been changed to <strong>${newRole.replace('-', ' ')}</strong>.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;"/>
      <p style="color:#999;font-size:12px;">NexusFinance — Smart Lending Platform</p>
    </div>`,
  }),
  verifyEmail: (name: string, link: string) => ({
    subject: 'NexusFinance — Verify Your Email',
    html: `<div style="font-family:system-ui;max-width:480px;margin:0 auto;padding:24px;">
      <h2 style="font-size:20px;margin:0 0 8px;">Welcome to NexusFinance</h2>
      <p style="color:#555;font-size:14px;line-height:1.5;">Hi ${name},</p>
      <p style="color:#555;font-size:14px;line-height:1.5;">Thanks for creating an account. Please verify your email address by clicking the button below:</p>
      <a href="${link}" style="display:inline-block;background:#0F171C;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;margin:20px 0;">Verify Email</a>
      <p style="color:#555;font-size:14px;line-height:1.5;">Or copy this link: <br/><a href="${link}" style="color:#5CF2D0;font-size:12px;">${link}</a></p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;"/>
      <p style="color:#999;font-size:12px;">NexusFinance — Smart Lending Platform</p>
    </div>`,
  }),
};
