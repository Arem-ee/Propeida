import { CAMPAIGN_CTA_URL } from '../campaign/messages.ts'

export const campaignExpiredEmail = {
  subject: 'Your full access has ended',

  text: `Hi,

Your 24-hour full access to the Propeida question bank has ended — this is expected, and nothing about your account or subscription changed.

If the full question bank helped you practice, you can keep using it with Pro. UNILORIN Post-UTME is only a few days away, and Pro gives you every question, full mock exams, and detailed explanations for the final stretch.

Upgrade here: ${CAMPAIGN_CTA_URL}

Whatever you decide, good luck on the exam — you've got this.

— The Propeida Team
propeida.help@gmail.com`,

  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your full access has ended</title>
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
                Your full access has ended
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 32px 32px 32px; font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 1.6; color: #374151;">
              <p style="margin: 0 0 16px 0;">Hi,</p>
              <p style="margin: 0 0 16px 0;">
                Your <strong>24-hour full access</strong> to the Propeida question bank has ended — this is expected, and nothing about your account or subscription changed.
              </p>
              <p style="margin: 0 0 16px 0;">
                If the full question bank helped you practice, you can <strong>keep using it with Pro</strong>. UNILORIN Post-UTME is only a few days away, and Pro gives you every question, full mock exams, and detailed explanations for the final stretch.
              </p>
              <p style="margin: 0 0 20px 0;">
                <a href="${CAMPAIGN_CTA_URL}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-weight: bold; text-decoration: none; border-radius: 8px; padding: 12px 24px;">Upgrade to Pro</a>
              </p>
              <p style="margin: 0 0 16px 0;">
                Whatever you decide, good luck on the exam — you've got this.
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

export function getCampaignExpiredEmail() {
  return {
    subject: campaignExpiredEmail.subject,
    text: campaignExpiredEmail.text,
    html: campaignExpiredEmail.html,
  }
}