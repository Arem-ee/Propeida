# Branded Supabase auth emails

Supabase sends the confirmation email when someone signs up, and those emails use Supabase's default wording, sender, and styling until you change them. This guide moves auth email through Resend, sends it from `hello@propeida.online`, and replaces the templates with the branded versions in this folder.

You only need dashboard access for this. No code change is required.

## What the recipient sees

- Sender name: `Propeida`
- Sender address: `hello@propeida.online`
- Subject and body: the templates in `docs/supabase-auth-emails/`
- Button: a blue `Confirm my email` style button that matches the app
- Footer: a real contact address and a clear reason for the email

The verification URL still points at the Supabase project domain until you add a custom domain. The button hides that URL, so most people never see it. The section at the end explains the custom domain option.

## 1. Confirm Resend can send from the domain

In the Resend dashboard, open **Domains** and check that `propeida.online` shows as verified. The app already sends its welcome email from `hello@propeida.online`, so this should already be in place.

If you create a new API key for Supabase, give it permission to send email. Do not reuse a key that can only read data.

## 2. Set custom SMTP in Supabase

In the Supabase dashboard, open **Authentication → SMTP Settings** (some projects show this under **Project Settings → Auth**), enable custom SMTP, and use these values:

| Field | Value |
| --- | --- |
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | The Resend API key that starts with `re_` |
| Sender email | `hello@propeida.online` |
| Sender name | `Propeida` |

Port `465` uses implicit TLS. If your network blocks it, use port `587` instead. Both work with Resend.

Save the settings, then use the **Send test email** button in the same screen. The test should arrive from `Propeida <hello@propeida.online>`.

## 3. Set the Site URL and redirect URLs

Open **Authentication → URL Configuration**.

Set **Site URL** to:

```text
https://propeida.online
```

Add these under **Redirect URLs**, one per line:

```text
https://propeida.online/auth/callback
https://propeida.online/api/auth/confirm
http://localhost:3000/auth/callback
http://localhost:3000/api/auth/confirm
```

The app sends sign-up confirmations to `/api/auth/confirm?next=...` and Google sign-in to `/auth/callback`. The localhost entries let you test on your machine. If you use a different local port, add that origin too.

## 4. Paste the templates

Open **Authentication → Emails**. For each template, replace the subject and the message body with the values below.

| Supabase template | Subject | File |
| --- | --- | --- |
| Confirm sign up | `Confirm your email and start preparing` | `confirm-signup.html` |
| Magic link or OTP | `Your Propeida sign-in link` | `magic-link.html` |
| Reset password | `Reset your Propeida password` | `recovery.html` |
| Change email address | `Confirm your new email address` | `email-change.html` |
| Invite user | `You are invited to Propeida` | `invite.html` |
| Reauthentication | `{{ .Token }} is your Propeida verification code` | `reauthentication.html` |

Open each HTML file, copy everything, and paste it into the message body. The Supabase editor accepts raw HTML.

The reauthentication email shows a code instead of a button because Supabase only provides `{{ .Token }}` for that template. Every other template uses `{{ .ConfirmationURL }}`.

Today the app only sends the confirm sign up email. The other templates are ready for when you add magic link, password reset, email change, invite, or reauthentication screens, so pasting them now saves a second dashboard trip.

## 5. Test a real sign-up

1. Open an incognito window and go to `https://propeida.online/signup`.
2. Create an account with an address you can open.
3. Check that the email comes from `Propeida <hello@propeida.online>` and uses the new design.
4. Click the button and check that you land on `/home` already signed in.
5. Check that the welcome email also arrives.

If the confirmation link lands on `/login?error=verification_failed`, the redirect URL is missing from the allow list, or the link was already used once.

## Troubleshooting

**The email still comes from Supabase.** Custom SMTP is not saved, or the save failed because the API key is wrong. Re-enter the key and send a test email from the SMTP screen.

**The email comes from Resend but lands in spam.** Check that the Resend domain shows SPF, DKIM, and DMARC as verified. Send a test to a Gmail address and use "Show original" to confirm all three pass.

**The template shows `{{ .ConfirmationURL }}` as text.** The variable was pasted inside a code block or escaped. Replace the body with the raw HTML file again.

**The button opens a page that says the link expired.** The link can only be used once, and some email security scanners open links before the recipient does. Ask the person to sign up again so Supabase sends a fresh link.

**Supabase says the email rate limit was exceeded.** Supabase still applies its own auth rate limits even when you use custom SMTP. Wait a few minutes, or raise the limit under **Authentication → Rate Limits**.

**The link opens on the wrong domain.** Check the Site URL and the redirect allow list. The app also uses the origin the request came from, so open the link on the same domain you signed up on.

## Optional: remove the Supabase project domain from links

The email button points at `<project-ref>.supabase.co` before it redirects to Propeida. To replace that with your own domain, add a Supabase custom domain:

1. Open **Project Settings → Custom Domains** and add a subdomain such as `auth.propeida.online`.
2. Create the CNAME record Supabase shows you.
3. Activate the domain from the Supabase CLI or the dashboard.
4. Add `https://auth.propeida.online` to the `connect-src` directive in `next.config.ts`.
5. Point `NEXT_PUBLIC_SUPABASE_URL` at the custom domain when you are ready, then redeploy.

Custom domains are a paid Supabase add-on. They are not required for the sender name, sender address, or email design to look like Propeida.
