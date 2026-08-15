import { Spectral } from 'next/font/google'

export const spectral = Spectral({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-landing-serif',
})