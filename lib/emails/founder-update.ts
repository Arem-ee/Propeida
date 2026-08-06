export const founderUpdateEmail = {
  subject: 'A quick update from the founder of Propeida',

  text: `Hi,

I'm the founder of Propeida, and I wanted to personally thank you for being one of the first people to use the platform.

When you signed up, Propeida was mainly a CBT practice app for UNILORIN Post-UTME. Over the past few weeks, I've been working on something bigger.

The goal is now simple: every Nigerian student should be able to prepare for JAMB and Post-UTME without a paywall getting in the way.

Here's what's new:

- A redesigned practice experience
- Better progress tracking
- A new Revision Notes section for quick topic-by-topic revision
- Improved exam simulation
- A stronger focus on helping students actually prepare, not just answer questions

I'm still building Propeida myself, and the platform is growing because of early users like you. If something feels confusing, broken, or missing, I genuinely want to hear about it.

You can jump back in here:

https://propeida.vercel.app

I've also created a WhatsApp channel where I'll share Propeida updates, new features, exam coverage announcements, and important platform news as we build.

https://whatsapp.com/channel/0029Vb7q1taHFxP1Dr5TSJ2V

Thank you for being here early.

— Arem
Founder, Propeida`,

  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>A quick update from the founder of Propeida</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="padding: 32px 32px 8px 32px;">
              <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 13px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; color: #2563eb;">
                Propeida
              </p>
              <h1 style="margin: 12px 0 0 0; font-family: Arial, Helvetica, sans-serif; font-size: 24px; line-height: 1.3; color: #111827;">
                A quick update from the founder
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 32px 32px 32px; font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 1.6; color: #374151;">
              <p style="margin: 0 0 16px 0;">Hi,</p>
              <p style="margin: 0 0 16px 0;">
                I'm the founder of Propeida, and I wanted to personally thank you for being one of the first people to use the platform.
              </p>
              <p style="margin: 0 0 16px 0;">
                When you signed up, Propeida was mainly a CBT practice app for UNILORIN Post-UTME. Over the past few weeks, I've been working on something bigger.
              </p>
              <p style="margin: 0 0 16px 0;">
                The goal is now simple: every Nigerian student should be able to prepare for JAMB and Post-UTME without a paywall getting in the way.
              </p>
              <p style="margin: 0 0 8px 0;"><strong>Here's what's new:</strong></p>
              <ul style="margin: 0 0 16px 0; padding-left: 20px;">
                <li style="margin-bottom: 6px;">A redesigned practice experience</li>
                <li style="margin-bottom: 6px;">Better progress tracking</li>
                <li style="margin-bottom: 6px;">A new Revision Notes section for quick topic-by-topic revision</li>
                <li style="margin-bottom: 6px;">Improved exam simulation</li>
                <li>A stronger focus on helping students actually prepare, not just answer questions</li>
              </ul>
              <p style="margin: 0 0 16px 0;">
                I'm still building Propeida myself, and the platform is growing because of early users like you. If something feels confusing, broken, or missing, I genuinely want to hear about it.
              </p>
              <p style="margin: 0 0 8px 0;">You can jump back in here:</p>
              <p style="margin: 0 0 16px 0;">
                <a href="https://propeida.vercel.app" style="color: #2563eb; font-weight: bold; text-decoration: none;">https://propeida.vercel.app</a>
              </p>
              <p style="margin: 0 0 8px 0;">
                I've also created a WhatsApp channel where I'll share Propeida updates, new features, exam coverage announcements, and important platform news as we build.
              </p>
              <p style="margin: 0 0 24px 0;">
                <a href="https://whatsapp.com/channel/0029Vb7q1taHFxP1Dr5TSJ2V" style="color: #2563eb; font-weight: bold; text-decoration: none;">https://whatsapp.com/channel/0029Vb7q1taHFxP1Dr5TSJ2V</a>
              </p>
              <p style="margin: 0 0 4px 0;">Thank you for being here early.</p>
              <p style="margin: 0;">— Arem<br />Founder, Propeida</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
} as const

export function getFounderUpdateEmail() {
  return {
    subject: founderUpdateEmail.subject,
    text: founderUpdateEmail.text,
    html: founderUpdateEmail.html,
  }
}
