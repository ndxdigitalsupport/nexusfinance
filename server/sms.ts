import twilio from 'twilio';

export async function sendSMS(
  to: string, 
  text: string, 
  config?: any
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const gateway = config?.sms_gateway || 'sandbox';

  if (gateway === 'sandbox') {
    console.log(`[SMS Sandbox] Would send to ${to}: ${text}`);
    return { success: true, messageId: 'sandbox' };
  }

  if (gateway === 'twilio') {
    const accountSid = config?.twilio_account_sid || process.env.TWILIO_ACCOUNT_SID;
    const authToken = config?.twilio_auth_token || process.env.TWILIO_AUTH_TOKEN;
    const from = config?.twilio_phone_number || process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken) {
      return { success: false, error: 'Twilio Account SID or Auth Token is not configured.' };
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

  if (gateway === 'vonage') {
    const apiKey = config?.vonage_api_key || process.env.VONAGE_API_KEY;
    const apiSecret = config?.vonage_api_secret || process.env.VONAGE_API_SECRET;
    const from = config?.vonage_from_number || process.env.VONAGE_FROM || 'Nexus';

    if (!apiKey || !apiSecret) {
      return { success: false, error: 'Vonage API Key or Secret is not configured.' };
    }

    try {
      const url = `https://rest.nexmo.com/sms/json`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          api_key: apiKey,
          api_secret: apiSecret,
          to: to.replace('+', ''), // Vonage requires phone number without leading '+'
          from,
          text,
        }),
      });
      const data: any = await response.json();
      if (data.messages && data.messages[0] && data.messages[0].status === '0') {
        return { success: true, messageId: data.messages[0]['message-id'] };
      } else {
        const errorMsg = data.messages && data.messages[0] 
          ? data.messages[0]['error-text'] 
          : 'Vonage API responded with failure.';
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('[Vonage SMS Error]', err.message || err);
      return { success: false, error: err.message || 'Vonage SMS send failed.' };
    }
  }

  if (gateway === 'custom') {
    const urlTemplate = config?.custom_sms_url;
    if (!urlTemplate) {
      return { success: false, error: 'Custom SMS Gateway URL is not configured.' };
    }

    try {
      // Replace placeholders
      const finalUrl = urlTemplate
        .replace('{{to}}', encodeURIComponent(to))
        .replace('{{text}}', encodeURIComponent(text));

      const response = await fetch(finalUrl, { method: 'POST' });
      const respText = await response.text();
      return { success: true, messageId: `custom-response: ${respText.slice(0, 50)}` };
    } catch (err: any) {
      console.error('[Custom SMS Error]', err.message || err);
      return { success: false, error: err.message || 'Custom SMS send failed.' };
    }
  }

  return { success: false, error: `Unknown SMS gateway: ${gateway}` };
}
