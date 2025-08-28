import { NextApiRequest, NextApiResponse } from 'next'
import { EmailTemplate } from '@/types/email'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { to, template } = req.body as { to: string; template: EmailTemplate }
    const apiKey = process.env.SENDGRID_API_KEY

    if (!apiKey) {
      throw new Error('SendGrid API key missing')
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'help@nubiago.com' },
        subject: template.subject,
        content: [
          { type: 'text/plain', value: template.text },
          { type: 'text/html', value: template.html }
        ]
      })
    })

    if (!response.ok) {
      throw new Error(`SendGrid API error: ${response.status}`)
    }

    res.status(200).json({ success: true })
  } catch (error) {
    // // // console.error('Email sending error:', error)
    res.status(500).json({ error: 'Failed to send email' })
  }
}
