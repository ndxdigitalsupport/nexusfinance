export async function sendSMS(
  to: string, 
  text: string, 
  config?: any
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // 1. Try Brevo Gateway first
  const brevoApiKey = config?.brevo_api_key || process.env.BREVO_API_KEY;
  const brevoSenderName = config?.brevo_sender_name || process.env.BREVO_SENDER_NAME || 'NexusFinance';

  if (brevoApiKey) {
    try {
      console.log(`[Brevo SMS] Dispatching SMS to ${to}...`);
      const response = await fetch('https://api.brevo.com/v3/transactionalSMS/sms', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'api-key': brevoApiKey
        },
        body: JSON.stringify({
          sender: brevoSenderName,
          recipient: to,
          content: text,
          type: 'transactional'
        })
      });

      const resBody: any = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(resBody.message || `HTTP ${response.status} Error`);
      }

      return { 
        success: true, 
        messageId: resBody.messageId || String(resBody.reference || 'brevo') 
      };
    } catch (err: any) {
      console.error('[Brevo SMS Error]', err.message || err);
      return { success: false, error: err.message || 'Brevo SMS send failed.' };
    }
  }

  // 2. Fallback to Twilio if configured
  const accountSid = config?.twilio_account_sid || process.env.TWILIO_ACCOUNT_SID;
  const authToken = config?.twilio_auth_token || process.env.TWILIO_AUTH_TOKEN;
  const from = config?.twilio_phone_number || process.env.TWILIO_PHONE_NUMBER;

  if (accountSid && authToken && from) {
    try {
      const twilio = (await import('twilio')).default;
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

  // 3. Fallback to Sandbox logging
  console.log(`[SMS Sandbox] SMS gateway not configured. Would send to ${to}: ${text}`);
  return { success: true, messageId: 'sandbox' };
}
