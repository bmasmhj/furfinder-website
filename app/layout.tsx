import type { Metadata, Viewport } from "next";
import { generateMetadata } from "../lib/metadata";
import { Suspense } from "react";
import { Fraunces, Manrope } from "next/font/google";
import ProgressBar from "@/components/common/ProgressBar";
import { ThemeProvider } from "@/components/ui/theme-provider";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#143D2D",
};

export const metadata: Metadata = generateMetadata({
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${fraunces.variable} ${manrope.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="theme-color" content="#143D2D" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="antialiased">
        <div
          aria-hidden
          style={{ display: "none" }}
          dangerouslySetInnerHTML={{
            __html: `<!--
THESIS: An editorial field-guide for finding your way home replaces the
SaaS panic-button landing page — the site reads like a beautifully kept
community atlas, not a startup dashboard pitch.
OWN-WORLD: Deep Forest ink on Warm Cream paper, Amber as the one
confident action color, Leaf Green for hope/reunion, Warm Coral held in
reserve for urgency. Fraunces italic display serif + Manrope body.
Authored line-weight paw/map/compass marks replace all emoji and icon
tiles. Asymmetrical magazine spreads, curved section dividers, and a
hand-precise route line stand in for "the way home."
STORY: A visitor in distress or goodwill instantly reads this as a
serious, caring, competent place built by someone who lived this; sees
AI + map + community demonstrated, trusts the real reunion evidence,
and acts within seconds — report or browse — with a sticky mobile
action always in reach.
FIRST VIEWPORT: asymmetrical hero split. Left: huge italic-serif
headline "Every Missing Pet Has A Way Home," support line, Amber
primary CTA "Report a Lost Pet" + outlined secondary "Browse Found
Pets," three quiet live facts. Right: an illustrated compass/map
composition with glowing Amber + Leaf pins and a soft search-radius
pulse — no phone screenshot. A drawn route line runs from the headline
into the map.
FORM: magazine field-guide system, taken directly from the user's
fully pinned brief (palette, type, hero copy, section list) — no
concept-seed roll run; seed key: brief-pinned/no-roll.
FINISH: unreviewed and undocumented is unfinished; this build ends
with the finish review, the verdict, and DESIGN.md.
-->`,
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          forcedTheme="light"
          disableTransitionOnChange
        >
          <Suspense fallback={null}>
            <ProgressBar />
          </Suspense>
          {children}
          <SpeedInsights />
          <Analytics />
        </ThemeProvider>

      </body>
    </html>
  );
}
