"use client";

import { useEffect, useState } from "react";
import { Camera, ScanSearch, Waypoints, MapPin, BellRing, PartyPopper } from "lucide-react";
import Reveal from "./Reveal";

const STAGES = [
  { icon: Camera, title: "Upload a photo", body: "Add photos and a description to a lost or found report in under two minutes." },
  { icon: ScanSearch, title: "AI reads the details", body: "Visible markings, breed, colour and report text are compared against eligible reports." },
  { icon: Waypoints, title: "Matches are ranked", body: "A similarity score weighs how closely two reports resemble each other." },
  { icon: MapPin, title: "Location narrows it down", body: "Nearby reports inside your radius are prioritised over distant ones." },
  { icon: BellRing, title: "Both sides are notified", body: "Owner and finder get an alert the moment a strong candidate appears." },
  { icon: PartyPopper, title: "A reunion, verified", body: "You confirm the match — markings, records, a safe meeting — before anything is final." },
];

export default function AIMatchFlow() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setActive((a) => (a + 1) % STAGES.length), 2200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="relative overflow-hidden bg-forest px-6 py-24 text-cream md:py-28">
      <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]" viewBox="0 0 1440 600" preserveAspectRatio="none">
        <path d="M-40 100 C 300 40, 600 160, 900 90 S 1500 110, 1600 60" stroke="hsl(var(--cream))" strokeWidth="1.5" fill="none" />
        <path d="M-40 480 C 300 420, 600 540, 900 470 S 1500 490, 1600 440" stroke="hsl(var(--cream))" strokeWidth="1.5" fill="none" />
      </svg>

      <div className="relative mx-auto max-w-6xl">
        <Reveal className="mx-auto mb-6 max-w-[24ch] text-center font-display text-[36px] italic leading-[1.12] tracking-[-0.01em] max-md:text-[28px]">
          How the matching actually works
        </Reveal>
        <Reveal delay={60} className="mx-auto mb-16 max-w-[52ch] text-center font-body text-[16px] leading-relaxed text-cream/65">
          Not a black box — six honest steps from photo to reunion, with a person verifying every step of the way.
        </Reveal>

        <div className="relative">
          {/* connecting route line */}
          <div className="absolute left-6 top-8 bottom-8 w-px bg-cream/15 md:left-0 md:right-0 md:top-8 md:h-px md:w-auto md:bottom-auto" />

          <div className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-6">
            {STAGES.map((stage, i) => {
              const Icon = stage.icon;
              const isActive = i === active;
              return (
                <Reveal key={stage.title} delay={i * 70} className="relative flex gap-4 pl-16 md:flex-col md:gap-0 md:pl-0 md:text-center">
                  <span
                    className={`absolute left-0 top-0 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-[1.5px] transition-all duration-500 ease-expo md:static md:mx-auto md:mb-4 ${
                      isActive
                        ? "border-amber bg-amber text-forest scale-110 shadow-[0_0_0_6px_hsl(var(--amber)/0.18)]"
                        : "border-cream/25 bg-forest text-cream/70"
                    }`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <div>
                    <h3 className={`font-body text-[15px] font-bold transition-colors ${isActive ? "text-amber" : "text-cream"}`}>
                      {stage.title}
                    </h3>
                    <p className="mt-1.5 font-body text-[13.5px] leading-relaxed text-cream/65">{stage.body}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>

        <Reveal delay={200} className="mt-16 text-center font-body text-[13.5px] text-cream/65">
          AI matches are suggestions to verify, not proof of ownership — always confirm markings, records and a safe meeting first.
        </Reveal>
      </div>
    </section>
  );
}
