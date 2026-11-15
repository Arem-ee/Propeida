export const founderUpdateEmail = {
  subject: 'A quick update from the Propeida team',

  text: `Hi,

Thank you for being one of the first candidates to use Propeida.

Over the past few weeks, we've been working on improving the platform, and we wanted to let you know what has changed.

We're still building Propeida step by step, and we're trying to make exam preparation more useful and accessible for Nigerian candidates.

Here are a few things that are new:

- Better practice tracking
- A new Revision Notes section for quick topic-by-topic revision
- Improved mock exam experience
- General improvements across the platform

You can jump back in here:

https://propeida.online

We've also created an official WhatsApp channel where we'll post updates about Propeida, new features, exam coverage, and other important changes:

https://whatsapp.com/channel/0029Vb7q1taHFxP1Dr5TSJ2V

If you know someone preparing for JAMB or UNILORIN Post-UTME, we'd really appreciate it if you shared Propeida with them.

Thanks again for being here early.

The Propeida Team
propeida.help@gmail.com`,

  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>A quick update from the Propeida team</title>
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
                A quick update from the Propeida team
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 32px 32px 32px; font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 1.6; color: #374151;">
              <p style="margin: 0 0 16px 0;">Hi,</p>
              <p style="margin: 0 0 16px 0;">
                Thank you for being one of the first candidates to use <strong>Propeida</strong>.
              </p>
              <p style="margin: 0 0 16px 0;">
                Over the past few weeks, we've been working on improving the platform, and we wanted to let you know what has changed.
              </p>
              <p style="margin: 0 0 16px 0;">
                We're still building Propeida step by step, and we're trying to make exam preparation more useful and accessible for Nigerian candidates.
              </p>
              <p style="margin: 0 0 8px 0;"><strong>Here are a few things that are new:</strong></p>
              <ul style="margin: 0 0 16px 0; padding-left: 20px;">
                <li style="margin-bottom: 6px;">Better practice tracking</li>
                <li style="margin-bottom: 6px;">A new <strong>Revision Notes</strong> section for quick topic-by-topic revision</li>
                <li style="margin-bottom: 6px;">Improved mock exam experience</li>
                <li>General improvements across the platform</li>
              </ul>
              <p style="margin: 0 0 8px 0;">You can jump back in here:</p>
              <p style="margin: 0 0 16px 0;">
                <a href="https://propeida.online" style="color: #2563eb; font-weight: bold; text-decoration: none;">https://propeida.online</a>
              </p>
              <p style="margin: 0 0 8px 0;">
                We've also created an official WhatsApp channel where we'll post updates about <strong>Propeida, new features, exam coverage, and other important changes</strong>:
              </p>
              <p style="margin: 0 0 16px 0;">
                <a href="https://whatsapp.com/channel/0029Vb7q1taHFxP1Dr5TSJ2V" style="color: #2563eb; font-weight: bold; text-decoration: none;">https://whatsapp.com/channel/0029Vb7q1taHFxP1Dr5TSJ2V</a>
              </p>
              <p style="margin: 0 0 16px 0;">
                If you know someone preparing for <strong>JAMB or UNILORIN Post-UTME</strong>, we'd really appreciate it if you shared Propeida with them.
              </p>
              <p style="margin: 0 0 24px 0;">Thanks again for being here early.</p>
              <p style="margin: 0;"><strong>The Propeida Team</strong><br /><a href="mailto:propeida.help@gmail.com" style="color: #2563eb; text-decoration: none;">propeida.help@gmail.com</a></p>
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
