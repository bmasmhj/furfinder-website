import { Compass, HeartHandshake, Sprout } from "lucide-react"
import Reveal from "./Reveal"

const rows = [
  {
    icon: Compass,
    role: "The Searcher",
    title: "My pet is lost",
    description: "Your pet is missing and every minute feels like an eternity. Here's how we help you get them back.",
    items: [
      "Create and review a detailed lost-pet report",
      "AI suggests possible matches from eligible reports",
      "Share a printable flyer with one tap",
      "Message anyone who spots your pet directly",
      "Offer a reward to boost your report's visibility",
    ],
    align: "left" as const,
  },
  {
    icon: HeartHandshake,
    role: "The Finder",
    title: "I found a pet",
    description: "You've spotted a lost animal and want to reunite it with its family. You're in the right place.",
    items: [
      "Post a found report with photos",
      "Review suggested matches from eligible nearby reports",
      "Quick Snap to ID the pet using biometric scan",
      "Find nearby vets and shelters to take the pet",
      "Contact the owner safely through the app",
    ],
    align: "right" as const,
  },
  {
    icon: Sprout,
    role: "The Neighbour",
    title: "I want to help",
    description: "You care about animals in your community and want to play an active part in reuniting them.",
    items: [
      "Browse the live map for pets reported near you",
      "Get area alerts for new reports in your suburb",
      "Leave community tips on reports you've seen",
      "Share reports to your social networks",
      "Contribute to reward pools for lost pets",
    ],
    align: "left" as const,
  },
]

export default function WhoisitFor() {
  return (
    <section className="bg-cream px-6 py-24 md:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto mb-16 max-w-[22ch] text-center font-display text-[36px] italic leading-[1.1] tracking-[-0.01em] text-forest max-md:text-[28px]">
          Built for everyone who loves animals
        </Reveal>

        <div className="flex flex-col gap-16 md:gap-20">
          {rows.map((row, i) => {
            const Icon = row.icon
            const reversed = row.align === "right"
            return (
              <Reveal
                key={row.role}
                delay={i * 60}
                className={`grid items-center gap-8 border-t border-forest/10 pt-12 md:grid-cols-[0.85fr_1.15fr] md:gap-14 ${
                  reversed ? "md:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div className={reversed ? "md:text-right" : ""}>
                  <span
                    className={`mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl border-[1.5px] border-forest/15 text-forest ${
                      reversed ? "" : ""
                    }`}
                  >
                    <Icon className="h-7 w-7" strokeWidth={1.75} />
                  </span>
                  <p className="font-body text-[13px] font-semibold uppercase tracking-[0.14em] text-forest/75">
                    {row.role}
                  </p>
                  <h3 className="mt-1.5 font-display text-[30px] italic leading-tight text-forest">
                    {row.title}
                  </h3>
                  <p className="mt-3 max-w-[42ch] font-body text-[15.5px] leading-relaxed text-forest/75 md:ml-0">
                    {row.description}
                  </p>
                </div>

                <ul className={`flex flex-col gap-3 ${reversed ? "md:items-start" : ""}`}>
                  {row.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 font-body text-[15px] text-forest/80">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-leaf" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
