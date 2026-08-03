import Link from "next/link";
import { PawPrint } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-cream/10 bg-forest px-6 py-16 text-cream/65">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border-[1.5px] border-cream/25 text-cream">
                <PawPrint className="h-4 w-4" strokeWidth={2} />
              </span>
              <span className="font-display text-lg italic text-cream">The Fur Finder</span>
            </div>
            <p className="mt-4 max-w-sm font-body text-sm leading-7 text-cream/65">
              Australia&apos;s AI-powered lost and found pets platform.
              Reuniting pets with their families, one report at a time.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-body text-xs font-semibold uppercase tracking-[0.16em] text-cream/90">
              App
            </h4>
            <div className="space-y-2.5 font-body text-sm">
              <Link href="/download" className="block transition hover:text-amber">
                Download App
              </Link>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-body text-xs font-semibold uppercase tracking-[0.16em] text-cream/90">
              Resources
            </h4>
            <div className="space-y-2.5 font-body text-sm">
              <Link href="/features" className="block transition hover:text-amber">Features</Link>
              <Link href="/how-it-works" className="block transition hover:text-amber">How It Works</Link>
              <Link href="/faq" className="block transition hover:text-amber">FAQ</Link>
              <Link href="/support" className="block transition hover:text-amber">Support</Link>
              <Link href="/contact" className="block transition hover:text-amber">Contact</Link>
              <a href="https://partners.thefurfinder.com/partner/signup" target="_blank" rel="noreferrer" className="block transition hover:text-amber">Partner With Us</a>
              <Link href="/blog" className="block transition hover:text-amber">Blog</Link>
              <Link href="/reunited-stories" className="block transition hover:text-amber">Reunited Stories</Link>
              <Link href="/about" className="block transition hover:text-amber">Our Story</Link>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-body text-xs font-semibold uppercase tracking-[0.16em] text-cream/90">
              Legal
            </h4>
            <div className="space-y-2.5 font-body text-sm">
              <Link href="/privacy-policy" className="block transition hover:text-amber">Privacy Policy</Link>
              <Link href="/terms-of-use" className="block transition hover:text-amber">Terms of Use</Link>
              <Link href="/delete-account" className="block transition hover:text-amber">Delete Account</Link>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-cream/10 pt-7 font-body text-xs text-cream/60 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2026 The Fur Finder. Made with love in Australia.</p>
          <div className="flex gap-5">
            <Link href="/privacy-policy" className="transition hover:text-amber">Privacy</Link>
            <Link href="/terms-of-use" className="transition hover:text-amber">Terms</Link>
            <Link href="/delete-account" className="transition hover:text-amber">Delete Account</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
