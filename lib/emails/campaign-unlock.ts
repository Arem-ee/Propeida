import { CAMPAIGN_CTA_URL } from '../campaign/messages.ts'

export const campaignUnlockEmail = {
  subject: "Don't wait until the night before UNILORIN Post-UTME",

  text: `Hi,

UNILORIN Post-UTME is in 4 days.

For the next 24 hours, we've unlocked the entire Propeida question bank for everyone who has already signed up.

Use today to go through questions you haven't seen before, identify the topics you're still weak in, and take a few mock exams under real exam conditions.

After the 24 hours, access to the full question bank goes back to Pro only.

If you find the full question bank useful, consider subscribing before the exam. It's a small amount compared to the cost of missing admission by a few marks, and it gives you access to everything you need for the final stretch.

Open Propeida: ${CAMPAIGN_CTA_URL}

Whatever you decide, make these last four days count.

— The Propeida Team
propeida.help@gmail.com`,

  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Don't wait until the night before UNILORIN Post-UTME</title>
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
                Don't wait until the night before UNILORIN Post-UTME
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 32px 32px 32px; font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 1.6; color: #374151;">
              <p style="margin: 0 0 16px 0;">Hi,</p>
              <p style="margin: 0 0 16px 0;">
                <strong>UNILORIN Post-UTME is in 4 days.</strong>
              </p>
              <p style="margin: 0 0 16px 0;">
                For the next <strong>24 hours</strong>, we've unlocked the <strong>entire Propeida question bank</strong> for everyone who has already signed up.
              </p>
              <p style="margin: 0 0 16px 0;">
                Use today to go through questions you haven't seen before, identify the topics you're still weak in, and take a few mock exams under real exam conditions.
              </p>
              <p style="margin: 0 0 16px 0;">
                After the 24 hours, access to the full question bank goes back to <strong>Pro only</strong>.
              </p>
              <p style="margin: 0 0 16px 0;">
                If you find the full question bank useful, consider subscribing before the exam. It's a small amount compared to the cost of missing admission by a few marks, and it gives you access to everything you need for the final stretch.
              </p>
              <p style="margin: 0 0 20px 0;">
                <a href="${CAMPAIGN_CTA_URL}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-weight: bold; text-decoration: none; border-radius: 8px; padding: 12px 24px;">Open Propeida</a>
              </p>
              <p style="margin: 0 0 16px 0;">
                Whatever you decide, <strong>make these last four days count</strong>.
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

export function getCampaignUnlockEmail() {
  return {
    subject: campaignUnlockEmail.subject,
    text: campaignUnlockEmail.text,
    html: campaignUnlockEmail.html,
  }
}