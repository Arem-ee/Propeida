export const founderUpdateEmail = {
  subject: 'A quick update from the Propeida team',

  text: `Hi,

Thank you for being one of the first students to use Propeida.

Over the past few weeks, we've been working on improving the platform, and we wanted to let you know what's changed.

Our goal is to make quality exam preparation more accessible for Nigerian students, and we're working toward expanding access while improving the platform.

Here's what's new:

- A redesigned practice experience
- Better progress tracking
- A new Revision Notes section for quick topic-by-topic revision
- Improved exam simulation
- A stronger focus on helping students actually prepare, not just answer questions

You can jump back in here:

https://propeida.online

We've also created an official WhatsApp channel where we share Propeida updates, new features, exam coverage announcements, and important platform news:

https://whatsapp.com/channel/0029Vb7q1taHFxP1Dr5TSJ2V

If you know someone preparing for UNILORIN Post-UTME, JAMB, or any upcoming entrance exam, we'd really appreciate it if you shared Propeida with them. Most of our growth right now comes from students telling other students, and every share genuinely helps.

Thank you for being part of the journey from the beginning.

— The Propeida Team
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
                Thank you for being one of the first students to use <strong>Propeida</strong>.
              </p>
              <p style="margin: 0 0 16px 0;">
                Over the past few weeks, we've been working on improving the platform, and we wanted to let you know what's changed.
              </p>
              <p style="margin: 0 0 16px 0;">
                Our goal is to make quality exam preparation more accessible for Nigerian students, and we're working toward expanding access while improving the platform.
              </p>
              <p style="margin: 0 0 8px 0;"><strong>Here's what's new:</strong></p>
              <ul style="margin: 0 0 16px 0; padding-left: 20px;">
                <li style="margin-bottom: 6px;">A redesigned practice experience</li>
                <li style="margin-bottom: 6px;">Better progress tracking</li>
                <li style="margin-bottom: 6px;">A new <strong>Revision Notes</strong> section for quick topic-by-topic revision</li>
                <li style="margin-bottom: 6px;">Improved exam simulation</li>
                <li>A stronger focus on helping students actually prepare, not just answer questions</li>
              </ul>
              <p style="margin: 0 0 8px 0;">You can jump back in here:</p>
              <p style="margin: 0 0 16px 0;">
                <a href="https://propeida.online" style="color: #2563eb; font-weight: bold; text-decoration: none;">https://propeida.online</a>
              </p>
              <p style="margin: 0 0 8px 0;">
                We've also created an official WhatsApp channel where we share <strong>Propeida updates, new features, exam coverage announcements, and important platform news</strong>:
              </p>
              <p style="margin: 0 0 16px 0;">
                <a href="https://whatsapp.com/channel/0029Vb7q1taHFxP1Dr5TSJ2V" style="color: #2563eb; font-weight: bold; text-decoration: none;">https://whatsapp.com/channel/0029Vb7q1taHFxP1Dr5TSJ2V</a>
              </p>
              <p style="margin: 0 0 16px 0;">
                If you know someone preparing for <strong>UNILORIN Post-UTME, JAMB, or any upcoming entrance exam</strong>, we'd really appreciate it if you shared Propeida with them. Most of our growth right now comes from students telling other students, and every share genuinely helps.
              </p>
              <p style="margin: 0 0 24px 0;">Thank you for being part of the journey from the beginning.</p>
              <p style="margin: 0;">— <strong>The Propeida Team</strong><br /><a href="mailto:propeida.help@gmail.com" style="color: #2563eb; text-decoration: none;">propeida.help@gmail.com</a></p>
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
