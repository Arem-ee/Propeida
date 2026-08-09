import { CAMPAIGN_CTA_URL } from '../campaign/messages.ts'

export const campaignReminderEmail = {
  subject: 'You still have time',

  text: `Hi,

UNILORIN Post-UTME is very close now.

Your full access to the Propeida question bank is still active — but the unlock ends soon, so this is the time to use it.

Try to get through as many questions as you can before it's gone: go after the topics you're still weak in, and take a mock exam or two under real exam timing.

Open Propeida: ${CAMPAIGN_CTA_URL}

Make these last hours count.

— The Propeida Team
propeida.help@gmail.com`,

  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You still have time</title>
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
                You still have time
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 32px 32px 32px; font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 1.6; color: #374151;">
              <p style="margin: 0 0 16px 0;">Hi,</p>
              <p style="margin: 0 0 16px 0;">
                <strong>UNILORIN Post-UTME is very close now.</strong>
              </p>
              <p style="margin: 0 0 16px 0;">
                Your full access to the <strong>Propeida question bank</strong> is still active — but the unlock ends soon, so this is the time to use it.
              </p>
              <p style="margin: 0 0 16px 0;">
                Try to get through as many questions as you can before it's gone: go after the topics you're still weak in, and take a mock exam or two under real exam timing.
              </p>
              <p style="margin: 0 0 20px 0;">
                <a href="${CAMPAIGN_CTA_URL}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-weight: bold; text-decoration: none; border-radius: 8px; padding: 12px 24px;">Open Propeida</a>
              </p>
              <p style="margin: 0 0 16px 0;">
                Make these last hours count.
              </p>
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

export function getCampaignReminderEmail() {
  return {
    subject: campaignReminderEmail.subject,
    text: campaignReminderEmail.text,
    html: campaignReminderEmail.html,
  }
}