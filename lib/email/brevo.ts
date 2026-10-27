export async function sendVerificationEmail(to: string, verifyUrl: string): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY
  const from = process.env.EMAIL_FROM
  if (!apiKey || !from) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[dev] Verification email link:', verifyUrl)
    }
    return
  }
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { email: from, name: 'FareFlip' },
      to: [{ email: to }],
      subject: 'Verify your email',
      htmlContent: `<p>Verify your email to save your plans:</p><p><a href="${verifyUrl}">Verify email</a></p>`,
    }),
  })
  if (!res.ok) {
    throw new Error('Failed to send verification email')
  }
}
