# Design

<!-- impeccable:design-schema 1 -->

## World

Editorial field guide for finding your way home. The site reads like a well-kept community atlas — asymmetrical magazine spreads, hand-precise route lines, and honest illustrated diagrams — not a stacked-card SaaS landing page. Built as a full redesign; the prior coral/teal/Poppins look is discarded, not extended.

No photography anywhere (including the hero) — confirmed product decision, since no real pet/community photography exists in this repo and stock photos are explicitly out. Warmth and emotion come from color, type, motion, and authored geometry instead. The one exception: real user-submitted reunion photos from the `reunited_stories` table render as-is when present (genuine user content, not stock).

## Palette

Color strategy: **Full palette**, four named roles, chosen at page scale (fields that own whole sections — mission band, AI-match section, footer — not accents scattered on a neutral ground).

- Deep Forest `#143D2D` (`--forest`) — ink, dark section fills, primary text.
- Warm Cream `#F9F6EF` (`--cream`) — paper, light section fills.
- Amber `#FFB84C` (`--amber`) — the one confident action color (primary CTAs, active states).
- Leaf Green `#69C36D` (`--leaf`) — hope/reunion/positive indicators (small dots, success accents).
- Warm Coral `#F56C6C` (`--coral`) — held in reserve for urgency/emphasis, not the primary CTA fill.
- Warm grays throughout (`--muted-foreground: 30 10% 38%`), never cool/blue-grays.

**Text-on-light variants exist and must be used, not the raw brand hues:** `--coral-text` (`0 87% 45%`) and `--leaf-text` (`122 43% 34%`) are darkened for AA contrast when coral/leaf sit as *text* on cream. The vivid `--coral`/`--leaf` tokens are for fills, dots, and icons only, or for text on dark (forest) backgrounds where they already pass. This distinction was a real bug caught during build (raw coral/leaf as text on cream measured 2.0–2.7:1) — preserve it in all future work.

All theme tokens live in `app/globals.css` under `:root` / `.dark` and are exposed as Tailwind colors in `tailwind.config.ts` (`forest`, `cream`, `amber`, `leaf`, `coral`, `leaf-text`, `coral-text`, plus the existing shadcn-style semantic slots `background`/`foreground`/`primary`/etc., which are now wired to this palette). Dark mode is supported and inverts forest/cream (forest becomes the light foreground, cream becomes a dark paper surface) so `bg-cream`/`text-forest` pairings stay correct in both themes without per-component dark: overrides.

## Typography

- Display: Fraunces (italic, 400/500/600), loaded via `next/font/google` as `--font-display`. Used for every heading, always in a serif italic register — this is the brand's signature voice, not a decorative accent.
- Body: Manrope, loaded as `--font-body`, weights 400–800.
- No Inter, no system-stack display face. Headings are large (30–52px), tracked slightly tight (-0.01 to -0.02em), and carry real compositional weight — never just bigger body text.
- No kicker/eyebrow pill badges anywhere (explicit ban carried from the brief/craft floor) — section labels are either folded into running text (Hero's "Australia's first AI-powered..." line) or dropped in favor of a strong heading.

## Layout & Motion

- Asymmetrical grids (`1.1fr/0.95fr` hero split, alternating-reversed storytelling rows in `WhoIsItFor`, hub-and-spoke `CommunityEcosystem` diagram) — rhythm changes section to section rather than repeating one card grid.
- Section backgrounds alternate cream/forest as full-bleed fields, not bordered card zones.
- Low-opacity SVG contour-line textures (topographic, not decorative gradients) appear behind the hero and the AI-match section — reads as "map/field surface," tying back to the product.
- Radii: 12–20px on cards/buttons/panels; full-round (`rounded-full`) reserved for small controls only (icon badges, the header CTA underline bar, dots).
- Icons: `lucide-react` line icons only — no emoji, no rounded-square icon-tile backgrounds. Icon marks use a plain bordered circle/rounded-square container (`border-forest/15`, no fill) at consistent stroke weight.
- Motion primitives: `components/marketing/Reveal.tsx` (IntersectionObserver-driven fade/rise, `prefers-reduced-motion`-aware, opts out instantly) and `components/marketing/Magnetic.tsx` (cursor-follow button pull, `--ease-spring: cubic-bezier(0.3, 1.15, 0.64, 1)` — a deliberately mild overshoot for the brief's named "magnetic buttons," flagged by the mechanical detector as bounce-easing and kept intentionally; do not remove without revisiting that request). `IllustratedMap.tsx` and `AIMatchFlow.tsx` self-cycle an "active" state on an interval as a lightweight stand-in for real-time activity.
- All custom keyframes/durations live in `tailwind.config.ts` (`float-slow`, `pulse-ring`, `paw-step`, `marquee-x`) and `app/globals.css` (`--ease-expo`, `--ease-spring`, `--dur-*`). `prefers-reduced-motion: reduce` collapses all animation/transition durations globally in `globals.css`.

## Components built this pass

- `components/marketing/Hero.tsx` — full rebuild: editorial headline, real hero CTAs wired to `https://app.thefurfinder.com` (report/browse) plus the original iOS/Android/Web trio preserved below the fold line.
- `components/marketing/IllustratedMap.tsx` — stylized (non-live) map/compass composition: contour lines, dashed route lines, pulsing search radius, cycling pin markers. Explicitly not wired to the real Leaflet map or live report data (product decision).
- `components/marketing/WhoIsItFor.tsx` — storytelling triptych (Searcher/Finder/Neighbour), alternating layout, replaces the old identical-card "Who It's For" grid.
- `components/marketing/AIMatchFlow.tsx` — six-stage animated match pipeline on a forest field, ends with an honest "suggestions to verify, not proof" disclaimer (matches the app's real legal/AI disclaimer language — do not drop this line in future edits).
- `components/marketing/CommunityEcosystem.tsx` — hub-and-spoke diagram (Vets/Shelters/Rescues/Neighbours around "The Map").
- `components/marketing/MobileStickyCTA.tsx` — mobile-only (`md:hidden`) bottom action bar, appears after 480px scroll.
- Header/Footer restyled in place (nav structure and links untouched — some links, e.g. Adopt/Partners, belong to unrelated in-progress work and were preserved, not designed around).

## What's intentionally out of scope this pass

Per user decision, this pass covers the shared design system (tokens, fonts, motion) and the homepage as the flagship. The other ~22 marketing routes (`app/(general)/*`) inherit the new tokens automatically (colors/fonts/radii) since they reuse `globals.css`/`tailwind.config.ts` and the restyled Header/Footer, but have **not** been individually redesigned/restructured yet. Treat this file as the system to extend into them next, in the order the user prioritizes.

## Known deviations / disclosures

- No image generation or `impeccable-finish-reviewer`/`impeccable-documenter` subagents were available in this harness; the visualize/decision-page step and the finish-review step were substituted with an in-thread pass (manual contrast audit, mechanical `detect.mjs` run, and this document written directly) rather than the shipped subagent flow. Disclosed per the skill's own instructions for a degraded environment.
- The mechanical detector's only remaining flag is the `Magnetic` component's spring easing (see Motion above) — kept deliberately for the brief's named "magnetic buttons" request.
