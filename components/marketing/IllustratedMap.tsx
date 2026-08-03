"use client";

import { useEffect, useRef, useState } from "react";

type Pin = {
  x: number;
  y: number;
  tone: "amber" | "leaf" | "coral";
  label: string;
  delay: number;
};

const PINS: Pin[] = [
  { x: 300, y: 210, tone: "leaf", label: "You are here", delay: 0 },
  { x: 168, y: 128, tone: "amber", label: "Lost — Border Collie", delay: 0.4 },
  { x: 420, y: 96, tone: "coral", label: "Sighting reported", delay: 0.9 },
  { x: 388, y: 288, tone: "amber", label: "Found — Tabby cat", delay: 1.3 },
  { x: 132, y: 296, tone: "leaf", label: "Reunited today", delay: 1.7 },
];

const toneColor: Record<Pin["tone"], string> = {
  amber: "hsl(var(--amber))",
  leaf: "hsl(var(--leaf))",
  coral: "hsl(var(--coral))",
};

function PinMark({ pin, active }: { pin: Pin; active: boolean }) {
  const c = toneColor[pin.tone];
  return (
    <g
      transform={`translate(${pin.x} ${pin.y})`}
      className="animate-float-slow"
      style={{ animationDelay: `${pin.delay}s`, opacity: active ? 1 : 0.32 }}
    >
      {active && (
        <circle r="10" fill="none" stroke={c} strokeWidth="1.5" className="animate-pulse-ring" />
      )}
      <path
        d="M0,18 C-13,-2 -13,-22 0,-22 C13,-22 13,-2 0,18 Z"
        fill={c}
        stroke="hsl(var(--forest))"
        strokeWidth="1.25"
      />
      <circle cy="-14" r="4" fill="hsl(var(--cream))" />
    </g>
  );
}

export default function IllustratedMap({
  variant = "hero",
  className,
}: {
  variant?: "hero" | "section";
  className?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % PINS.length);
    }, 2600);
    return () => window.clearInterval(id);
  }, []);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: px * -6, y: py * -6 });
  };

  return (
    <div
      ref={wrapRef}
      onMouseMove={handleMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      className={`relative overflow-hidden rounded-[20px] border border-forest/15 bg-cream shadow-[0_30px_60px_-25px_hsl(var(--forest)/0.45)] ${className ?? ""}`}
    >
      <svg
        viewBox="0 0 560 400"
        className="h-full w-full"
        style={{
          transform: `translate(${tilt.x}px, ${tilt.y}px)`,
          transition: "transform 300ms var(--ease-expo)",
        }}
        role="img"
        aria-label="Illustrated map of nearby lost and found pet reports across a neighbourhood"
      >
        <rect width="560" height="400" fill="hsl(var(--cream))" />

        {/* Contour texture — reads as topography, not decoration */}
        <g stroke="hsl(var(--forest) / 0.12)" strokeWidth="1" fill="none">
          <path d="M-20 60 C 120 20, 260 100, 400 40 S 620 60, 700 20" />
          <path d="M-20 150 C 140 110, 260 190, 420 130 S 620 150, 700 110" />
          <path d="M-20 240 C 140 200, 300 280, 440 220 S 620 240, 700 200" />
          <path d="M-20 330 C 140 300, 300 360, 460 310 S 620 330, 700 300" />
        </g>

        {/* Route lines connecting reports, drawn like a field-guide trail */}
        <g stroke="hsl(var(--forest) / 0.35)" strokeWidth="1.75" strokeDasharray="2 7" strokeLinecap="round" fill="none">
          <path d="M300 210 L168 128" />
          <path d="M300 210 L420 96" />
          <path d="M300 210 L388 288" />
          <path d="M300 210 L132 296" />
        </g>

        {/* Search radius around home base */}
        <circle cx="300" cy="210" r="150" fill="hsl(var(--leaf) / 0.06)" stroke="hsl(var(--leaf) / 0.4)" strokeWidth="1.5" strokeDasharray="3 6" />
        <circle cx="300" cy="210" r="90" fill="none" stroke="hsl(var(--leaf) / 0.5)" strokeWidth="1.25" strokeDasharray="1 5" />

        {PINS.map((pin, i) => (
          <PinMark key={pin.label} pin={pin} active={i === activeIndex} />
        ))}
      </svg>

      {variant === "hero" && (
        <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl border border-forest/10 bg-cream px-4 py-2.5 shadow-[0_8px_20px_-12px_hsl(var(--forest)/0.5)]">
          <span className="font-body text-[13px] font-semibold text-forest">{PINS[activeIndex].label}</span>
          <span className="flex h-2 w-2 rounded-full bg-leaf" />
        </div>
      )}
    </div>
  );
}
