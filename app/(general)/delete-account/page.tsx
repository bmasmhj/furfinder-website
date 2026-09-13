import type { Metadata } from 'next'
import { supportEmail, deleteAccountCards } from '@/components/marketing/site-content'

export const metadata: Metadata = {
  title: 'Delete Account - The Fur Finder',
  description: 'Account and data deletion information for The Fur Finder.',
}

export default function DeleteAccountPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main>
        <section className="border-b border-border bg-gradient-to-b from-background to-orange-50/50 px-6 py-20 text-center dark:to-orange-950/10 md:px-8">
          <span className="inline-flex rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Account Management
          </span>
          <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-extrabold tracking-[-0.05em] text-foreground md:text-6xl">
            Account &amp; Data Deletion
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
            You have full control over your account and personal data. Delete your account or request data removal at any time.
          </p>
        </section>

        <div className="mx-auto max-w-4xl px-6 py-12 md:px-8">
          <div className="space-y-6">
            {deleteAccountCards.map((card, index) => (
              <section key={card.title} className="rounded-2xl border border-border bg-card p-8 transition-shadow hover:shadow-md">
                <h2 className="text-2xl font-bold text-foreground">{card.title}</h2>
                <div className="mt-4 text-[15px] leading-8 text-muted-foreground">{card.content}</div>
                {index === 0 ? (
                  <div className="mt-5 rounded-xl border-l-4 border-primary bg-primary/10 px-5 py-4 text-sm font-medium text-primary">
                    Account deletion is permanent and cannot be undone.
                  </div>
                ) : null}
                {index === 1 ? (
                  <a
                    className="mt-6 inline-flex rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#e55a3a]"
                    href={`mailto:${supportEmail}?subject=Account%20Deletion%20Request`}
                  >
                    Request Account Deletion
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
