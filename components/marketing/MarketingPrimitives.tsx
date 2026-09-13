import type { ReactNode } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function MarketingSection({
  id,
  eyebrow,
  eyebrowTone = 'coral',
  title,
  description,
  centered = false,
  className = '',
  children,
}: {
  id?: string
  eyebrow?: string
  eyebrowTone?: 'coral' | 'teal' | 'purple'
  title?: string
  description?: string
  centered?: boolean
  className?: string
  children: ReactNode
}) {
  const eyebrowToneClass =
    eyebrowTone === 'teal'
      ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
      : eyebrowTone === 'purple'
        ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
        : 'bg-primary/10 text-primary'

  return (
    <section id={id} className={cn('mx-auto max-w-6xl px-6 py-16', className)}>
      <div className={centered ? 'text-center' : ''}>
        {eyebrow ? (
          <span
            className={cn(
              'mb-4 inline-flex rounded-full px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]',
              eyebrowToneClass
            )}
          >
            {eyebrow}
          </span>
        ) : null}
        {title ? (
          <h2 className="text-3xl font-bold tracking-[-0.03em] text-foreground md:text-4xl">{title}</h2>
        ) : null}
        {description ? (
          <p
            className={cn(
              'mt-3 text-[15px] leading-7 text-muted-foreground',
              centered ? 'mx-auto max-w-2xl' : 'max-w-2xl'
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      <div className="mt-10">{children}</div>
    </section>
  )
}

export function DownloadButton({
  href,
  variant = 'primary',
  children,
  external = true,
}: {
  href: string
  variant?: 'primary' | 'secondary' | 'ghost'
  children: ReactNode
  external?: boolean
}) {
  const variantClass =
    variant === 'secondary'
      ? 'border border-border bg-card text-foreground hover:border-primary hover:text-primary'
      : variant === 'ghost'
        ? 'bg-muted text-foreground hover:bg-muted/80'
        : 'bg-primary text-white shadow-[0_10px_30px_rgba(255,107,74,0.25)] hover:bg-[#e5553a]'

  const props = external
    ? { target: '_blank' as const, rel: 'noreferrer' }
    : {}

  return (
    <Link
      href={href}
      {...props}
      className={cn('inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold transition', variantClass)}
    >
      {children}
    </Link>
  )
}

export function LegalPageLayout({
  tone = 'coral',
  title,
  subtitle,
  meta,
  children,
}: {
  tone?: 'coral' | 'teal'
  title: string
  subtitle: string
  meta?: string
  children: ReactNode
}) {
  const bgClass =
    tone === 'teal'
      ? 'from-teal-500 to-teal-400'
      : 'from-primary to-[#ff8a6e]'

  return (
    <div className="min-h-screen bg-background">
      <div className={cn('bg-gradient-to-br px-6 py-12 text-center', bgClass)}>
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        <p className="mt-2 text-sm text-white/90">{subtitle}</p>
      </div>
      <div className="mx-auto max-w-4xl px-6 py-10">
        {meta ? <p className="mb-6 text-sm text-muted-foreground">{meta}</p> : null}
        <div className="space-y-8">{children}</div>
      </div>
    </div>
  )
}

export function LegalSection({ title, body }: { title: string; body: string }) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <p className="mt-3 whitespace-pre-line text-[15px] leading-8 text-muted-foreground">{body}</p>
    </section>
  )
}
