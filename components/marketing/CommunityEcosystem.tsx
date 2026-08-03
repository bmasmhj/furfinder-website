import { Stethoscope, Home, ShieldCheck, Users, PawPrint } from "lucide-react";
import Reveal from "./Reveal";

const NODES = [
  { icon: Stethoscope, label: "Vets", body: "Nearby clinics surfaced the moment a report or match needs one.", pos: { top: "6%", left: "50%" } },
  { icon: Home, label: "Shelters", body: "Pound and shelter intake shown alongside live reports, not siloed apart.", pos: { top: "50%", left: "94%" } },
  { icon: ShieldCheck, label: "Rescues", body: "Rescue organisations get visibility into reports matching their focus area.", pos: { top: "94%", left: "50%" } },
  { icon: Users, label: "Neighbours", body: "Anyone nearby can leave a tip, share a report, or just keep an eye out.", pos: { top: "50%", left: "6%" } },
];

export default function CommunityEcosystem() {
  return (
    <section className="bg-cream px-6 py-24 md:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-16 md:grid-cols-[1fr_1.05fr] md:gap-10">
        <Reveal className="order-2 md:order-1">
          <h2 className="max-w-[16ch] font-display text-[36px] italic leading-[1.1] tracking-[-0.01em] text-forest max-md:text-[28px]">
            One connected ecosystem, not four separate phone calls
          </h2>
          <p className="mt-5 max-w-[46ch] font-body text-[16px] leading-relaxed text-forest/75">
            Vets, shelters, rescue organisations, and everyday neighbours already want the same outcome. The Fur Finder puts them on one map, working from the same report, instead of scattered across calls, flyers, and separate Facebook groups.
          </p>
          <ul className="mt-8 flex flex-col gap-4">
            {NODES.map((node) => {
              const Icon = node.icon;
              return (
                <li key={node.label} className="flex items-start gap-3.5">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-[1.5px] border-forest/15 text-forest">
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <p className="font-body text-[14.5px] leading-relaxed text-forest/75">
                    <span className="font-bold text-forest">{node.label}.</span> {node.body}
                  </p>
                </li>
              );
            })}
          </ul>
        </Reveal>

        <Reveal delay={100} className="relative order-1 mx-auto aspect-square w-full max-w-[420px] md:order-2">
          {/* connective lines */}
          <svg aria-hidden viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
            <line x1="50" y1="50" x2="50" y2="10" stroke="hsl(var(--forest) / 0.25)" strokeWidth="0.6" strokeDasharray="1.5 2.5" />
            <line x1="50" y1="50" x2="88" y2="50" stroke="hsl(var(--forest) / 0.25)" strokeWidth="0.6" strokeDasharray="1.5 2.5" />
            <line x1="50" y1="50" x2="50" y2="90" stroke="hsl(var(--forest) / 0.25)" strokeWidth="0.6" strokeDasharray="1.5 2.5" />
            <line x1="50" y1="50" x2="12" y2="50" stroke="hsl(var(--forest) / 0.25)" strokeWidth="0.6" strokeDasharray="1.5 2.5" />
          </svg>

          {/* center node */}
          <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-1 rounded-full border-2 border-forest bg-amber text-forest shadow-[0_0_0_10px_hsl(var(--amber)/0.14)]">
            <PawPrint className="h-6 w-6" strokeWidth={2} />
            <span className="font-body text-[10px] font-bold uppercase tracking-wide">The Map</span>
          </div>

          {NODES.map((node) => {
            const Icon = node.icon;
            return (
              <div
                key={node.label}
                className="absolute flex w-[104px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 text-center"
                style={{ top: node.pos.top, left: node.pos.left }}
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl border-[1.5px] border-forest/20 bg-cream text-forest shadow-[0_10px_20px_-14px_hsl(var(--forest)/0.5)]">
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
                </span>
                <span className="font-body text-[12.5px] font-semibold text-forest/75">{node.label}</span>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
