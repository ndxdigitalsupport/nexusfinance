import twilio from 'twilio';

export async function sendSMS(
  to: string, 
  text: string, 
  config?: any
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const accountSid = config?.twilio_account_sid || process.env.TWILIO_ACCOUNT_SID;
  const authToken = config?.twilio_auth_token || process.env.TWILIO_AUTH_TOKEN;
  const from = config?.twilio_phone_number || process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken) {
    console.log(`[SMS Sandbox] Twilio not configured. Would send to ${to}: ${text}`);
    return { success: true, messageId: 'sandbox' };
  }
  if (!from) {
    return { success: false, error: 'Twilio Phone Number (from) is not configured.' };
  }

  try {
    const client = twilio(accountSid, authToken);
    const message = await client.messages.create({
      body: text,
      to,
      from,
    });
    return { success: true, messageId: message.sid };
  } catch (err: any) {
    console.error('[Twilio SMS Error]', err.message || err);
    return { success: false, error: err.message || 'Twilio SMS send failed.' };
  }
}
