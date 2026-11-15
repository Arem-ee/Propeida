// Campaign copy shared across UI, email, and WhatsApp.
//
// NOTE: the CTA URL below is used verbatim in the email and WhatsApp messages.

export const CAMPAIGN_CTA_URL = 'https://propeida.online'

export const CAMPAIGN_COUNTDOWN_HEADLINE = 'Your entrance exam is in a few days'
export const CAMPAIGN_COUNTDOWN_SUB = 'You have full access to the Propeida question bank right now'

export const CAMPAIGN_WHATSAPP_CHANNEL_MESSAGE =
  '🎉 If you have already signed up, we have unlocked the full Propeida question bank for you. ' +
  'You now have 24 hours of complete access to all available questions. ' +
  'Use this opportunity to practise more, improve your score, and secure more topics before access expires. ' +
  '⏰ The unlock ends in 24 hours. 👉 https://propeida.online'

export const CAMPAIGN_WHATSAPP_EXPIRY_MESSAGE =
  'The 24-hour unlock has ended. If you used the full question bank yesterday, you already know the difference. ' +
  'You can still continue practising with the complete question bank by upgrading to Pro before the exam. ' +
  'https://propeida.online'

// Sent by students to a parent/guardian — prefilled via a wa.me share link on
// the upgrade page and the post-expiry upgrade screen.
const CAMPAIGN_PARENT_PITCH = [
  'Hi 👋',
  '',
  'I’ve been preparing for my entrance exam on Propeida, and their Pro plan unlocks the full question bank, with every question, mock exams with real exam timing, and detailed explanations.',
  `My entrance exam is in a few days, and I really want the full question bank before the exam.`,
  `It’s a one-time payment of ₦1,500. Could we please get it?`,
  '',
  'Here’s the app: https://propeida.online',
].join('\n')

export function buildParentShareLink(): string {
  return `https://wa.me/?text=${encodeURIComponent(CAMPAIGN_PARENT_PITCH)}`
}

export function getCampaignParentPitch(): string {
  return CAMPAIGN_PARENT_PITCH
}