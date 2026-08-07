export const welcomeEmail = {
  subject: 'Welcome to Propeida',

  text: `Hi,

Welcome to Propeida.

Thanks for creating an account.

Propeida is built for students preparing for JAMB, Post-UTME, and other entrance exams, and the goal is simple: help you prepare in a way that feels closer to the real exam.

Here's what you can do right now:

- Practice CBT-style questions
- Take timed mock exams
- Track your progress
- Use Revision Notes for quick topic-by-topic revision
- Return later and continue from where you stopped

You can get started here:

https://propeida.online

We've also created an official WhatsApp channel where we post updates about Propeida, new features, and exam coverage:

https://whatsapp.com/channel/0029Vb7q1taHFxP1Dr5TSJ2V

If anything feels confusing, broken, or could be improved, just reply to this email. We read the feedback ourselves.

Thanks again for joining us.

— The Propeida Team
propeida.help@gmail.com`,

  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Propeida</title>
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
                Welcome to Propeida
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 32px 32px 32px; font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 1.6; color: #374151;">
              <p style="margin: 0 0 16px 0;">Hi,</p>
              <p style="margin: 0 0 16px 0;">
                Welcome to <strong>Propeida</strong>.
              </p>
              <p style="margin: 0 0 16px 0;">
                Thanks for creating an account.
              </p>
              <p style="margin: 0 0 16px 0;">
                Propeida is built for students taking <strong>JAMB, Post-UTME, and other entrance exams</strong>, and the goal is simple: help you prepare in a way that feels closer to the real exam.
              </p>
              <p style="margin: 0 0 8px 0;"><strong>Here's what you can do right now:</strong></p>
              <ul style="margin: 0 0 16px 0; padding-left: 20px;">
                <li style="margin-bottom: 6px;">Practice CBT-style questions</li>
                <li style="margin-bottom: 6px;">Take timed mock exams</li>
                <li style="margin-bottom: 6px;">Track your progress</li>
                <li style="margin-bottom: 6px;">Use <strong>Revision Notes</strong> for quick topic-by-topic revision</li>
                <li>Return later and continue from where you stopped</li>
              </ul>
              <p style="margin: 0 0 8px 0;">You can get started here:</p>
              <p style="margin: 0 0 16px 0;">
                <a href="https://propeida.online" style="color: #2563eb; font-weight: bold; text-decoration: none;">https://propeida.online</a>
              </p>
              <p style="margin: 0 0 8px 0;">
                We've also created an official WhatsApp channel where we post updates about <strong>Propeida, new features, and exam coverage</strong>:
              </p>
              <p style="margin: 0 0 16px 0;">
                <a href="https://whatsapp.com/channel/0029Vb7q1taHFxP1Dr5TSJ2V" style="color: #2563eb; font-weight: bold; text-decoration: none;">https://whatsapp.com/channel/0029Vb7q1taHFxP1Dr5TSJ2V</a>
              </p>
              <p style="margin: 0 0 16px 0;">
                If anything feels confusing, broken, or could be improved, just reply to this email. We read the feedback ourselves.
              </p>
              <p style="margin: 0 0 24px 0;">Thanks again for joining us.</p>
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

export function getWelcomeEmail() {
  return {
    subject: welcomeEmail.subject,
    text: welcomeEmail.text,
    html: welcomeEmail.html,
  }
}