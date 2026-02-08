/* eslint-disable @typescript-eslint/no-explicit-any */
import { Resend } from 'resend';

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!resendClient) resendClient = new Resend(apiKey);
  return resendClient;
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Vertex Premium Bank <onboarding@resend.dev>';
const FROM_NAME = 'Vertex Premium Bank';

export interface SendWelcomeEmailParams {
  to: string;
  firstName: string;
  accountNumber: string;
  accountType: string;
}

/**
 * Send welcome email with account number after registration.
 * Does not throw; logs errors so registration can succeed even if email fails.
 */
export async function sendWelcomeEmail(params: SendWelcomeEmailParams): Promise<{ ok: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) {
    console.warn('[mailer] RESEND_API_KEY not set; skipping welcome email');
    return { ok: false, error: 'RESEND_API_KEY not set' };
  }

  const { to, firstName, accountNumber, accountType } = params;
  const subject = 'Welcome to Vertex Premium – Your Account Number';
  const html = getWelcomeEmailHtml({ firstName, accountNumber, accountType });

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('[mailer] Welcome email failed:', error);
      return { ok: false, error: error.message };
    }

    console.log('[mailer] Welcome email sent:', data?.id);
    return { ok: true };
  } catch (err: any) {
    console.error('[mailer] Welcome email error:', err);
    return { ok: false, error: err?.message || 'Failed to send email' };
  }
}

function getWelcomeEmailHtml(params: { firstName: string; accountNumber: string; accountType: string }): string {
  const { firstName, accountNumber, accountType } = params;
  const accountLabel = accountType === 'savings' ? 'High Yield Savings' : 'Premium Checking';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Vertex Premium</title>
</head>
<body style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; padding: 24px;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
    <div style="background: linear-gradient(135deg, #155DFC 0%, #1248d4 100%); padding: 32px 24px; text-align: center;">
      <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">Vertex Premium Bank</h1>
      <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Banking for the Digital Age</p>
    </div>
    <div style="padding: 32px 24px;">
      <h2 style="margin: 0 0 16px; color: #0f172b; font-size: 20px; font-weight: 700;">Welcome, ${firstName}!</h2>
      <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6;">
        Your Vertex Premium account has been created successfully. Use the details below to sign in.
      </p>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <p style="margin: 0 0 8px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Account number</p>
        <p style="margin: 0; color: #0f172b; font-size: 22px; font-weight: 700; letter-spacing: 0.08em; font-variant-numeric: tabular-nums;">${accountNumber}</p>
        <p style="margin: 12px 0 0; color: #64748b; font-size: 14px;">Account type: ${accountLabel}</p>
      </div>
      <p style="margin: 0 0 24px; color: #475569; font-size: 14px; line-height: 1.6;">
        Sign in at our website using this account number and the password you created. Keep this email safe and do not share your account number or password.
      </p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/#login" style="display: inline-block; background: #155DFC; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 16px; padding: 14px 24px; border-radius: 12px;">Sign in to your account</a>
    </div>
    <div style="padding: 20px 24px; border-top: 1px solid #f1f5f9; text-align: center;">
      <p style="margin: 0; color: #94a3b8; font-size: 12px;">&copy; ${new Date().getFullYear()} Vertex Premium Bank. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
