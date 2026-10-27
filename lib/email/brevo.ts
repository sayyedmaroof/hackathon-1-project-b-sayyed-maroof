async function sendBrevoEmail(to: string, subject: string, htmlContent: string): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY
  const from = process.env.EMAIL_FROM
  if (!apiKey || !from) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[dev] Email:', subject, to)
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
      subject,
      htmlContent,
    }),
  })
  if (!res.ok) {
    throw new Error('Failed to send email')
  }
}

export async function sendVerificationEmail(to: string, verifyUrl: string): Promise<void> {
  await sendBrevoEmail(
    to,
    'Verify your email',
    `<p>Verify your email to save your plans:</p><p><a href="${verifyUrl}">Verify email</a></p>`,
  )
}

export async function sendAccountExistsEmail(to: string): Promise<void> {
  await sendBrevoEmail(
    to,
    'You already have a FareFlip account',
    '<p>You already have an account. Sign in instead of creating a new one.</p>',
  )
}
