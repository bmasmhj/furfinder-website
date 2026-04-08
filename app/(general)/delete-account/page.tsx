import type { Metadata } from 'next'
import Header from '@/components/marketing/Header'
import Footer from '@/components/marketing/Footer'
import { supportEmail, deleteAccountCards } from '@/components/marketing/site-content'

export const metadata: Metadata = {
  title: 'Delete Account - The Fur Finder',
  description: 'Account and data deletion information for The Fur Finder.',
}

export default function DeleteAccountPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#1a1a2e]">
      <main>
        <section className="bg-[linear-gradient(135deg,#ff6b4a_0%,#ff8a6e_100%)] px-6 py-12 text-center md:px-8">
          <h1 className="text-3xl font-bold text-white">The Fur Finder Account &amp; Data Deletion</h1>
          <p className="mt-2 text-sm text-white/90">Delete your account or request data removal at any time.</p>
        </section>

        <div className="mx-auto max-w-4xl px-6 py-10 md:px-8">
          <div className="space-y-6">
            {deleteAccountCards.map((card, index) => (
              <section key={card.title} className="rounded-2xl bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <h2 className="text-2xl font-semibold text-[#1a1a2e]">{card.title}</h2>
                <div className="mt-4 text-[15px] leading-8 text-[#4a4a6a]">{card.content}</div>
                {index === 0 ? (
                  <div className="mt-5 rounded-xl border-l-4 border-[#ef4444] bg-[#fef2f2] px-5 py-4 text-sm font-medium text-[#991b1b]">
                    Account deletion is permanent and cannot be undone.
                  </div>
                ) : null}
                {index === 1 ? (
                  <a
                    className="mt-6 inline-flex rounded-xl bg-[#ff6b4a] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#e55a3a]"
                    href={`mailto:${supportEmail}?subject=Account%20Deletion%20Request`}
                  >
                    Request Account Deletion via Email
                  </a>
                ) : null}
              </section>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
