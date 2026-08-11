export const SIGNUP_APP_URL = 'https://propeida.online'

const signupConfirmReminder = {
  subject: 'Finish creating your Propeida account',

  text: `Hi,

You started a Propeida account but the verification link was never clicked — so your account isn't active yet.

We've just re-sent your confirmation link to this address. It's usually in your inbox; if it isn't there, check the junk/spam folder.

Once you click it you can log in and start practicing for the UNILORIN Post-UTME in under a minute:
${SIGNUP_APP_URL}/login

If the link still doesn't arrive, just reply to this email and we'll fix it for you personally.

The exam is close now — even one focused session a day makes a difference.

— The Propeida Team
propeida.help@gmail.com`,

  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Finish creating your Propeida account</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="padding: 32px 32px 8px 32px;">
              <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 13px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; color: #2563eb;">Propeida</p>
              <h1 style="margin: 12px 0 0 0; font-family: Arial, Helvetica, sans-serif; font-size: 24px; line-height: 1.3; color: #111827;">Finish creating your Propeida account</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 32px 32px 32px; font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 1.6; color: #374151;">
              <p style="margin: 0 0 16px 0;">Hi,</p>
              <p style="margin: 0 0 16px 0;">You started a Propeida account but the verification link was never clicked — so your account isn't active yet.</p>
              <p style="margin: 0 0 16px 0;">We've just <strong>re-sent your confirmation link</strong> to this address. It's usually in your inbox; if it isn't there, check the junk/spam folder.</p>
              <p style="margin: 0 0 16px 0;">Once you click it you can log in and start practicing for the UNILORIN Post-UTME in under a minute.</p>
              <p style="margin: 0 0 20px 0;">
                <a href="${SIGNUP_APP_URL}/login" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-weight: bold; text-decoration: none; border-radius: 8px; padding: 12px 24px;">Open Propeida</a>
              </p>
              <p style="margin: 0 0 16px 0;">If the link still doesn't arrive, just reply to this email and we'll fix it for you personally.</p>
              <p style="margin: 0 0 16px 0;"><strong>The exam is close now</strong> — even one focused session a day makes a difference.</p>
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

const signupFinishReminder = {
  subject: 'Your Propeida account is waiting — finish setup',

  text: `Hi,

Your Propeida account is ready to use — there's just one small step left.

Pick a username (it's how you'll appear on the leaderboard) and then start your first UNILORIN Post-UTME mock: 100 real-style questions under real exam timing, free.

Open Propeida:
${SIGNUP_APP_URL}

The exam is close now — where you start today decides what you revise in the days left.

— The Propeida Team
propeida.help@gmail.com`,

  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Propeida account is waiting</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="padding: 32px 32px 8px 32px;">
              <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 13px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; color: #2563eb;">Propeida</p>
              <h1 style="margin: 12px 0 0 0; font-family: Arial, Helvetica, sans-serif; font-size: 24px; line-height: 1.3; color: #111827;">Your Propeida account is waiting</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 32px 32px 32px; font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 1.6; color: #374151;">
              <p style="margin: 0 0 16px 0;">Hi,</p>
              <p style="margin: 0 0 16px 0;">Your Propeida account is ready to use — there's just one small step left.</p>
              <p style="margin: 0 0 16px 0;">Pick a <strong>username</strong> (it's how you'll appear on the leaderboard), then start your first <strong>UNILORIN Post-UTME mock</strong>: 100 real-style questions under real exam timing, free.</p>
              <p style="margin: 0 0 20px 0;">
                <a href="${SIGNUP_APP_URL}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-weight: bold; text-decoration: none; border-radius: 8px; padding: 12px 24px;">Open Propeida</a>
              </p>
              <p style="margin: 0 0 16px 0;"><strong>The exam is close now</strong> — where you start today decides what you revise in the days left.</p>
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

const signupNudgeReminder = {
  subject: 'UNILORIN Post-UTME is in 2 days',

  text: `Hi,

We noticed you signed up for Propeida but haven't completed a full mock exam yet.

With UNILORIN Post-UTME in 2 days, this is probably the best time to practice under real exam conditions.

We've also improved the question rotation, so your mock exams should feel much more realistic now.

Continue your preparation here: https://propeida.online

Wishing you the very best in your exam.

— Propeida`,

  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>UNILORIN Post-UTME is in 2 days</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="padding: 32px 32px 8px 32px;">
              <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 13px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; color: #2563eb;">Propeida</p>
              <h1 style="margin: 12px 0 0 0; font-family: Arial, Helvetica, sans-serif; font-size: 24px; line-height: 1.3; color: #111827;">UNILORIN Post-UTME is in 2 days</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 32px 32px 32px; font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 1.6; color: #374151;">
              <p style="margin: 0 0 16px 0;">Hi,</p>
              <p style="margin: 0 0 16px 0;">We noticed you signed up for Propeida but haven't completed a full mock exam yet.</p>
              <p style="margin: 0 0 16px 0;">With <strong>UNILORIN Post-UTME in 2 days</strong>, this is probably the best time to practice under real exam conditions.</p>
              <p style="margin: 0 0 16px 0;">We've also improved the question rotation, so your mock exams should feel much more realistic now.</p>
              <p style="margin: 0 0 20px 0;">
                <a href="${SIGNUP_APP_URL}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-weight: bold; text-decoration: none; border-radius: 8px; padding: 12px 24px;">Continue your preparation</a>
              </p>
              <p style="margin: 0 0 16px 0;">Wishing you the very best in your exam.</p>
              <p style="margin: 0;">— <strong>Propeida</strong></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
} as const

export function getSignupReminderEmail(type: 'confirm' | 'finish' | 'nudge') {
  const t = type === 'confirm' ? signupConfirmReminder : type === 'finish' ? signupFinishReminder : signupNudgeReminder
  return { subject: t.subject, text: t.text, html: t.html }
}