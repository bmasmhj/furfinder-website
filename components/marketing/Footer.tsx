import Link from "next/link";
export default function Footer() {
  return (
    <footer className="bg-[#080808] px-6 py-14 text-[#9ca3af]">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2 text-lg font-bold text-white">
              <span>🐾</span>
              <span>The Fur Finder</span>
            </div>
            <p className="mt-3 max-w-sm text-sm leading-7 text-[#6b7280]">
              Australia&apos;s AI-powered lost and found pets platform.
              Reuniting pets with their families, one report at a time.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-white">
              App
            </h4>
            <div className="space-y-2 text-sm">
              <Link href="/download" className="block text-[#6b7280] transition hover:text-primary">
                Download App
              </Link>
              <Link href="/pricing" className="block text-[#6b7280] transition hover:text-primary">
                Pricing
              </Link>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-white">
              Resources
            </h4>
            <div className="space-y-2 text-sm">
              <Link href="/how-it-works" className="block text-[#6b7280] transition hover:text-primary">How It Works</Link>
              <Link href="/faq" className="block text-[#6b7280] transition hover:text-primary">FAQ</Link>
              <Link href="/support" className="block text-[#6b7280] transition hover:text-primary">Support</Link>
              <Link href="/contact" className="block text-[#6b7280] transition hover:text-primary">Contact</Link>
              <Link href="/partner-registration" className="block text-[#6b7280] transition hover:text-primary">Partner With Us</Link>
              <Link href="/blog" className="block text-[#6b7280] transition hover:text-primary">Blog</Link>
              <Link href="/reunited-stories" className="block text-[#6b7280] transition hover:text-primary">Reunited Stories</Link>
              <Link href="/about" className="block text-[#6b7280] transition hover:text-primary">Our Story</Link>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-white">
              Legal
            </h4>
            <div className="space-y-2 text-sm">
              <Link href="/privacy-policy" className="block text-[#6b7280] transition hover:text-primary">Privacy Policy</Link>
              <Link href="/terms-of-use" className="block text-[#6b7280] transition hover:text-primary">Terms of Use</Link>
              <Link href="/delete-account" className="block text-[#6b7280] transition hover:text-primary">Delete Account</Link>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-[#1f1f1f] pt-7 text-xs text-[#4b5563] sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2026 The Fur Finder. Made with love in Australia.</p>
          <div className="flex gap-5">
            <Link href="/privacy-policy" className="transition hover:text-primary">Privacy</Link>
            <Link href="/terms-of-use" className="transition hover:text-primary">Terms</Link>
            <Link href="/delete-account" className="transition hover:text-primary">Delete Account</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
