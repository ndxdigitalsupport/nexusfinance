import twilio from 'twilio';

let client: twilio.Twilio | null = null;

function getClient(): twilio.Twilio {
  if (!client) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (!accountSid || !authToken) {
      throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set');
    }
    client = twilio(accountSid, authToken);
  }
  return client;
}

export async function sendSMS(to: string, text: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.log(`[SMS Sandbox] Would send to ${to}: ${text}`);
    return { success: true, messageId: 'sandbox' };
  }

  try {
    const from = process.env.TWILIO_PHONE_NUMBER;
    if (!from) {
      return { success: false, error: 'TWILIO_PHONE_NUMBER not configured' };
    }
    const message = await getClient().messages.create({
      body: text,
      to,
      from,
    });
    return { success: true, messageId: message.sid };
  } catch (err: any) {
    console.error('[SMS Error]', err.message || err);
    return { success: false, error: err.message || 'SMS send failed' };
  }
}
