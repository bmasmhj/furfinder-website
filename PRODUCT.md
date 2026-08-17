# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are Australian pet owners and community members in three situations:
- An owner whose pet just went missing, acting under acute stress and time pressure.
- Someone who has found a stray/lost animal and wants to safely reunite it with its owner.
- A community member (neighbour, volunteer, vet, shelter, rescue) who wants to help without owning a report.

The marketing site's job is to get a worried or well-meaning visitor to download the app (iOS/Android beta) or use the web app quickly, and to build enough trust that they follow through under stress.

## Product Purpose

The Fur Finder is a mobile-first (iOS/Android, with a web app option) lost-and-found pet platform for Australia. It combines AI-assisted photo/description matching, GPS-based proximity matching, a live map of lost/found reports plus vets/shelters/rescues, in-app messaging, biometric-style pet ID registration, and community tools (tips, alerts, flyers, "Happy Tails" reunion stories) into one place, replacing the current scattered reality of Facebook groups, flyers, and separate shelter/vet lookups.

Success = pets reunited with families faster than the status quo, and a compassionate, trustworthy community forming around that goal.

## Positioning

Positioned as Australia's first AI-powered pet recovery app — the one place that unifies AI photo/text matching, GPS-radius alerts, and a directory of vets/shelters/rescues, instead of the fragmented, manual process (scattered Facebook groups, physical flyers, separate shelter calls) every other option leaves owners with.

## Operating Context

- Currently in beta: iOS App Store beta, Android beta (request access), and a web app at app.thefurfinder.com. Availability/capacity may change, and marketing copy must not overstate current availability.
- Core workflows: create a lost/found report (photos, description, GPS location) → AI scans for matches (photo, description, location) → both sides notified → in-app messaging to coordinate a safe reunion.
- Also supports: pre-registering a pet profile (incl. biometric-style face/eye/nose photos) before it ever goes missing; scanning pasted text from a community post (not automatic social scraping) for details; browsing a map of vets/shelters/rescue orgs; generating a printable flyer from a report; suburb-based alerts; reward-pool support; reporting/blocking abuse.
- Monetization: Free tier (reports, map, directory, messaging, flyers) and Premium ($4.99/mo or $49.99/yr) which adds AI photo matching, AI scan-online-posts, biometric ID scanning, multi-photo upload, unlimited reports, area alerts, and boosted visibility.
- Legal/compliance-heavy: privacy policy, terms of use, account deletion, and AI/matching disclaimers are all real, detailed, and load-bearing (Australian consumer law referenced). Marketing language must stay consistent with those disclaimers (AI results are suggestions, not guarantees; ownership must be verified).

## Capabilities and Constraints

- Built on Next.js 15 (App Router) + TypeScript + Tailwind CSS, Postgres via `db` query layer. The homepage already pulls real data server-side: `reunited_stories` (featured, published) and `faqs` tables. This must stay real/data-driven — no fabricated stats or invented testimonials should be hardcoded to replace it.
- No real pet/community photography exists in this repo. Only an app-screenshot mockup (`assets/images/mobile.png`) and app icon assets exist. **Confirmed decision: build the entire visual identity as illustration/typography/graphic-led — no photography anywhere, including the hero.** Do not use stock photography.
- The existing app (not the marketing site) has a real Leaflet/react-leaflet map (`components/app/LeafletMap.tsx`) with live report data. **Confirmed decision: the marketing site's map experience is a stylized, illustrative, non-functional visual composition** (glowing pins, animated search radius, etc. as marketing motion/graphics) — not wired to live data or a real Leaflet instance. Keeps the marketing site decoupled from live/sensitive data and lightweight.
- Marketing pages live under `app/(general)/` (23+ routes: home, features, app-features, how-it-works, pricing, about/our-story, blog, reunited-stories, partners + partners/[id], adoption, advertise, partner-registration, download, faq, support, contact, safety-tips, join-testing, manage-ads, terms-of-use, privacy-policy, delete-account). Shared chrome in `components/marketing/` (Header, Footer, Hero, MarketingPrimitives, PricingCard, WhoIsItFor, PartnerInterestFunnel, site-content.tsx for copy/data).
- There are pre-existing uncommitted changes in this working tree to `.env.example`, `.env.local.example`, `app/(general)/partners/page.tsx`, `components/marketing/Header.tsx`, `lib/types.ts`, plus new untracked `adoption/`, `partners/[id]/`, `app/api/`, `components/adoption/`, `components/partners/` directories — unrelated in-progress work (a partners/adoption feature). Do not touch or revert these; treat them as pre-existing state to work around, not evidence for this task.

## Brand Commitments

- Name: "The Fur Finder." Existing brand voice in copy (founder story, FAQ, feature descriptions) is warm, direct, plain-language, and Australia-specific — preserve this voice; the redesign replaces visual language only, not copy meaning/hierarchy.
- Real founder story exists (`founderStory` in site-content.tsx): the founder's dog Lucky went missing for ~2.5 days; this is genuine evidence and should anchor emotional storytelling rather than inventing a different narrative.
- Current (pre-redesign) visual identity uses a coral/orange (#FF6B4A-ish) + teal palette and Poppins — this is the *incumbent* look and is treated as anti-reference per the user's explicit redesign brief, not as a constraint to preserve.
- User has pinned a full replacement visual direction for this redesign (see design brief): Deep Forest / Warm Cream / Amber / Leaf Green / Warm Coral palette; Fraunces-or-equivalent display serif + Manrope-or-equivalent body sans; premium wildlife-journal-meets-modern-tech aesthetic; magazine/editorial layout, not stacked SaaS cards. This pinned brief overrides the incumbent look entirely (this is a full redesign, not a refinement).

## Evidence on Hand

- Real, DB-backed reunited-stories data (pet name, story content, pet type, image URL) rendered on the homepage today — real evidence to keep surfacing, not fabricate replacements for.
- Real founder story text (see Brand Commitments).
- Real, detailed feature list, pricing, FAQ, privacy/terms content (site-content.tsx) — all real copy to restyle, not rewrite in meaning.
- No real numeric stats (e.g. "X pets reunited") exist anywhere in the codebase. Do not invent counters/stats; where the brief asks for "community statistics," either bind to real queryable data (e.g. count of published reunited_stories) or omit/use qualitative framing instead of fabricated numbers.
- No real pet or community photography exists (see Capabilities and Constraints).

## Product Principles

1. Speed under stress: every flow, especially reporting a lost pet, must read as fast and low-friction — this is a use case where minutes matter.
2. Real evidence over decoration: storytelling leans on the real founder story and real reunited-stories data; never fabricate testimonials, stats, or logos.
3. Trust through clarity, not hype: AI matching is presented honestly as "suggestions to verify," consistent with the app's legal disclaimers — the redesign's confident visual craft should not overstate certainty.
4. One visual system, applied in phases: a single new design system (tokens, type, motion, illustration language) gets built once and rolled out across all pages in priority order, rather than each page reinventing its own look.
5. Illustration and typography carry the brand, not photography — the emotional warmth has to come from color, type, motion, and drawn/graphic elements.

## Accessibility & Inclusion

No product-specific accessibility requirement was stated beyond the user's general brief (excellent contrast, keyboard support, reduced-motion support, semantic HTML) — treat these as binding requirements for this redesign.
