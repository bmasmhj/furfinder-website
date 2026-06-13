import { Check } from "lucide-react"

const cards = [
  {
    emoji: "😢",
    title: "My Pet Is Lost",
    description: "Your pet is missing and every minute feels like an eternity. Here's how we help you get them back.",
    items: [
      "Create and review a detailed lost-pet report",
      "AI suggests possible matches from eligible reports",
      "Share a printable flyer with one tap",
      "Message anyone who spots your pet directly",
      "Offer a reward to boost your report's visibility",
    ],
  },
  {
    emoji: "😊",
    title: "I Found a Pet",
    description: "You've spotted a lost animal and want to reunite it with its family. You're in the right place.",
    items: [
      "Post a found report with photos",
      "Review suggested matches from eligible nearby reports",
      "Quick Snap to ID the pet using biometric scan",
      "Find nearby vets and shelters to take the pet",
      "Contact the owner safely through the app",
    ],
  },
  {
    emoji: "🌱",
    title: "I Want to Help",
    description: "You care about animals in your community and want to play an active part in reuniting them.",
    items: [
      "Browse the live map for pets reported near you",
      "Get area alerts for new reports in your suburb",
      "Leave community tips on reports you've seen",
      "Share reports to your social networks",
      "Contribute to reward pools for lost pets",
    ],
  },
]

export default function WhoisitFor() {
  return (
    <section className="border-y border-border bg-muted/50">
      <div className="mx-auto max-w-7xl px-6 py-20 text-center">
        <div className="mb-3.5 inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-teal-600 dark:text-teal-400">
          Who It&apos;s For
        </div>
        <h2 className="mb-2.5 text-[30px] font-bold tracking-[-0.5px] text-foreground">
          Built for everyone who loves animals
        </h2>
        <p className="mx-auto mb-10 max-w-[580px] text-[15px] leading-[1.7] text-muted-foreground">
          Whether you&apos;ve lost a pet, found one, or just want to help your community — there&apos;s a place for you in The Fur Finder.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {cards.map((card) => (
            <div key={card.title} className="overflow-hidden rounded-[20px] border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg">
              <div className="px-7 pb-6 pt-8 text-center">
                <span className="mb-3.5 block text-[40px]">{card.emoji}</span>
                <h3 className="mb-2 text-[17px] font-bold text-foreground">{card.title}</h3>
                <p className="text-[13px] leading-relaxed text-muted-foreground">{card.description}</p>
              </div>
              <div className="border-t border-border px-7 py-5">
                {card.items.map((item) => (
                  <div key={item} className="mb-3 flex items-start gap-2.5 text-left text-[13px] text-foreground/80 last:mb-0">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
