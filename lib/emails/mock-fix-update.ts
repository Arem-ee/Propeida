export const mockFixUpdateEmail = {
  subject: 'A quick update about Propeida',

  text: `Hi,

We wanted to let you know about something that affected some students over the past few days.

A few people ran into a problem where they couldn't start another mock exam after taking one, and in some cases the app showed an error page instead of working normally.

We've fixed it.

From now on, all students can take mock exams as many times as they like. The difference between the free version and the upgraded version is no longer the number of mock attempts — it's the number of verified questions you have access to.

Here's what that means:

- Free users can take unlimited mock exams and practice sessions using the 100-question verified UNILORIN question pool.
- Upgraded users unlock the full verified question bank and help us keep adding more questions, revision notes, and support for more schools.

You can continue using Propeida here:

https://propeida.online

If you'd like to support what we're building and unlock the full question bank, you can do that here:

https://propeida.online/support

Whether you upgrade or continue using the free version, thank you for being part of Propeida this early. We're still building it step by step, and your feedback has genuinely helped us improve it.

— The Propeida Team
propeida.help@gmail.com`,

  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>A quick update about Propeida</title>
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
                A quick update about Propeida
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 32px 32px 32px; font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 1.6; color: #374151;">
              <p style="margin: 0 0 16px 0;">Hi,</p>
              <p style="margin: 0 0 16px 0;">
                We wanted to let you know about something that affected some students over the past few days.
              </p>
              <p style="margin: 0 0 16px 0;">
                A few people ran into a problem where they couldn't start another mock exam after taking one, and in some cases the app showed an error page instead of working normally.
              </p>
              <p style="margin: 0 0 16px 0;">
                We've fixed it.
              </p>
              <p style="margin: 0 0 16px 0;">
                From now on, all students can take mock exams as many times as they like. The difference between the free version and the upgraded version is no longer the number of mock attempts — it's the number of <strong>verified questions</strong> you have access to.
              </p>
              <p style="margin: 0 0 8px 0;"><strong>Here's what that means:</strong></p>
              <ul style="margin: 0 0 16px 0; padding-left: 20px;">
                <li style="margin-bottom: 6px;">Free users can take <strong>unlimited mock exams and practice sessions</strong> using the 100-question verified UNILORIN question pool.</li>
                <li>Upgraded users unlock the full verified question bank and help us keep adding more questions, revision notes, and support for more schools.</li>
              </ul>
              <p style="margin: 0 0 8px 0;">You can continue using Propeida here:</p>
              <p style="margin: 0 0 16px 0;">
                <a href="https://propeida.online" style="color: #2563eb; font-weight: bold; text-decoration: none;">https://propeida.online</a>
              </p>
              <p style="margin: 0 0 8px 0;">
                If you'd like to support what we're building and unlock the full question bank, you can do that here:
              </p>
              <p style="margin: 0 0 16px 0;">
                <a href="https://propeida.online/support" style="color: #2563eb; font-weight: bold; text-decoration: none;">https://propeida.online/support</a>
              </p>
              <p style="margin: 0 0 16px 0;">
                Whether you upgrade or continue using the free version, thank you for being part of <strong>Propeida</strong> this early. We're still building it step by step, and your feedback has genuinely helped us improve it.
              </p>
              <p style="margin: 0 0 24px 0;">Warm regards,</p>
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

export function getMockFixUpdateEmail() {
  return {
    subject: mockFixUpdateEmail.subject,
    text: mockFixUpdateEmail.text,
    html: mockFixUpdateEmail.html,
  }
}