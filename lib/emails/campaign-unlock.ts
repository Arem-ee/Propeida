import { CAMPAIGN_CTA_URL } from '../campaign/messages.ts'

export const campaignUnlockEmail = {
  subject: "You've been granted full access to Propeida for 24 hours",

  text: `Hi,

We’ve unlocked the full Propeida question bank for you — completely free, for the next 24 hours.

This is our way of saying thank you for being an early Propeida user.

What you can do right now:

- Practice with the complete question bank — every available question
- Take full mock exams with real exam timing
- Review detailed answers and explanations
- Climb the university leaderboard

Your access will automatically expire after 24 hours, and you’ll simply return to your current plan. Nothing changes about your account or subscription.

Start practicing here:

${CAMPAIGN_CTA_URL}

Make the most of it — we believe in you.

— The Propeida Team
propeida.help@gmail.com`,

  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You've been granted full access to Propeida for 24 hours</title>
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
                Your full question bank is unlocked
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 32px 32px 32px; font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 1.6; color: #374151;">
              <p style="margin: 0 0 16px 0;">Hi,</p>
              <p style="margin: 0 0 16px 0;">
                We’ve unlocked the <strong>full Propeida question bank</strong> for you — completely free, for the next <strong>24 hours</strong>.
              </p>
              <p style="margin: 0 0 16px 0;">
                This is our way of saying thank you for being an <strong>early Propeida user</strong>.
              </p>
              <p style="margin: 0 0 8px 0;"><strong>What you can do right now:</strong></p>
              <ul style="margin: 0 0 16px 0; padding-left: 20px;">
                <li style="margin-bottom: 6px;">Practice with the <strong>complete question bank</strong> — every available question</li>
                <li style="margin-bottom: 6px;">Take full mock exams with real exam timing</li>
                <li style="margin-bottom: 6px;">Review detailed answers and explanations</li>
                <li>Climb the university leaderboard</li>
              </ul>
              <p style="margin: 0 0 16px 0;">
                Your access will <strong>automatically expire after 24 hours</strong>, and you’ll simply return to your current plan. Nothing changes about your account or subscription.
              </p>
              <p style="margin: 0 0 8px 0;">Start practicing here:</p>
              <p style="margin: 0 0 20px 0;">
                <a href="${CAMPAIGN_CTA_URL}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-weight: bold; text-decoration: none; border-radius: 8px; padding: 12px 24px;">Start practicing — it’s free for 24 hours</a>
              </p>
              <p style="margin: 0 0 16px 0;">
                Make the most of it — we believe in you.
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