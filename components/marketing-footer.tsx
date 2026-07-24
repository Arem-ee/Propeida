export default function MarketingFooter() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-gray-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-base">
                P
              </span>
              Propeida
            </div>
            <p className="mt-4 text-sm text-gray-500 max-w-sm leading-relaxed">
              The fastest, most efficient path to passing competitive exams in Nigeria. Built specifically for JAMB, WAEC, and Post-UTME preparation.
            </p>
            <div className="mt-4 inline-flex items-center rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">
              Free to start &bull; ₦1,500 one-time upgrade
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-3">
              <li>
                <a href="/#simulator" className="text-sm text-gray-500 hover:text-blue-600 min-h-[44px] py-1 block">
                  Practice Simulator
                </a>
              </li>
              <li>
                <a href="/#features" className="text-sm text-gray-500 hover:text-blue-600 min-h-[44px] py-1 block">
                  CBT Features
                </a>
              </li>
              <li>
                <a href="/#exams" className="text-sm text-gray-500 hover:text-blue-600 min-h-[44px] py-1 block">
                  Supported Exams
                </a>
              </li>
              <li>
                <a href="/#pricing" className="text-sm text-gray-500 hover:text-blue-600 min-h-[44px] py-1 block">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-3">
              <li>
                <a href="/#benefits" className="text-sm text-gray-500 hover:text-blue-600 min-h-[44px] py-1 block">
                  Benefits
                </a>
              </li>
              <li>
                <a href="/#faq" className="text-sm text-gray-500 hover:text-blue-600 min-h-[44px] py-1 block">
                  Support FAQ
                </a>
              </li>
              <li>
                <a href="/terms" className="text-sm text-gray-500 hover:text-blue-600 min-h-[44px] py-1 block">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-sm text-gray-500 hover:text-blue-600 min-h-[44px] py-1 block">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            &copy; 2026 Propeida. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-gray-400">
            <span>Optimized for budget mobile networks</span>
            <span>&bull;</span>
            <span>Secured via Paystack</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
