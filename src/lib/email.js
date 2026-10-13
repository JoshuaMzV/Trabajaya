export async function sendEmailViaEmailJS({
  toEmail,
  toName,
  subject,
  templateType,
  variables = {}
}) {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !publicKey) {
    return { success: true, simulated: true };
  }

  const payload = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    accessToken: privateKey,
    template_params: {
      to_email: toEmail,
      to_name: toName || 'Usuario',
      subject: subject || 'Notificación de TrabajaYa',
      event_type: templateType,
      ...variables
    }
  };

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[EmailJS Error] HTTP ${response.status}: ${errorText}`);
      return { success: false, error: errorText };
    }

    return { success: true };
  } catch (err) {
    console.error('[EmailJS Exception]', err);
    return { success: false, error: err.message };
  }
}
