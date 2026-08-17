import type { Metadata } from "next";
import Link from "next/link";
import { faqItems, supportEmail } from "@/components/marketing/site-content";
import { db } from "@/lib/db";
import Reveal from "@/components/marketing/Reveal";

export const metadata: Metadata = {
  title: "FAQ - The Fur Finder",
  description:
    "Frequently asked questions about The Fur Finder app and how it helps reunite lost pets with their families.",
};

async function getFaqs() {
  try {
    const faqs = await db.queryMany(
      'SELECT * FROM faqs WHERE is_active = true ORDER BY display_order ASC'
    );
    return faqs || [];
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return [];
  }
}

function FaqAccordion({ items }: { items: { key: string; question: string; answer: string }[] }) {
  return (
    <div className="mx-auto flex max-w-[720px] flex-col gap-3">
      {items.map((faq) => (
        <details
          key={faq.key}
          className="group rounded-[16px] border-[1.5px] border-forest/15 bg-card transition-colors open:border-forest/35"
        >
          <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left font-body text-[15px] font-semibold text-forest">
            {faq.question}
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[1.5px] border-forest/15 text-forest transition-transform group-open:rotate-45 group-open:border-amber group-open:bg-amber">
              +
            </span>
          </summary>
          <div className="border-t border-forest/10 px-6 pb-5 pt-4 text-left font-body text-sm leading-[1.8] text-forest/75">
            {faq.answer}
          </div>
        </details>
      ))}
    </div>
  );
}

export default async function FaqPage() {
  const databaseFaqs = await getFaqs();

  const groupedFaqs = databaseFaqs.reduce((acc: any, faq: any) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {});

  return (
    <div className="border-y border-forest/10 bg-cream text-forest" id="faq">
      <div className="mx-auto max-w-4xl px-6 py-20 text-center md:py-24">
        <Reveal as="h1" className="font-display text-[36px] italic tracking-[-0.01em] text-forest max-md:text-[28px]">
          Common questions
        </Reveal>
        <Reveal delay={40} className="mx-auto mt-3 max-w-[54ch] font-body text-[15px] leading-relaxed text-forest/75">
          Permissions, AI limits, safety, purchases, privacy, and account management.
        </Reveal>

        <div className="mb-14 mt-12">
          <Reveal as="h2" className="mb-6 text-left font-display text-[21px] italic text-forest">
            Essential information
          </Reveal>
          <FaqAccordion items={faqItems.map((faq) => ({ key: faq.question, ...faq }))} />
        </div>

        {Object.entries(groupedFaqs).map(([category, categoryFaqs]: [string, any]) => (
          <div key={category} className="mb-14 mt-12">
            <Reveal as="h2" className="mb-6 text-left font-display text-[21px] italic text-forest">
              {category}
            </Reveal>
            <FaqAccordion
              items={categoryFaqs.map((faq: any) => ({ key: faq.id, question: faq.question, answer: faq.answer }))}
            />
          </div>
        ))}

        <Reveal delay={40} className="mt-10 font-body text-sm text-forest/70">
          Still need help? Visit{" "}
          <Link href="/support" className="font-semibold text-forest underline decoration-amber decoration-2 underline-offset-4 hover:text-coral-text">
            Support
          </Link>{" "}
          or email{" "}
          <a href={`mailto:${supportEmail}`} className="font-semibold text-forest underline decoration-amber decoration-2 underline-offset-4 hover:text-coral-text">
            {supportEmail}
          </a>
          .
        </Reveal>
      </div>
    </div>
  );
}
