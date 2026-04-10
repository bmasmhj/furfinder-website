import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ - The Fur Finder",
  description:
    "Frequently asked questions about The Fur Finder app and how it helps reunite lost pets with their families.",
};

import { db } from "@/lib/db";

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


export default async function FaqPage() {
  const faqs = await getFaqs();

  // Group FAQs by category
  const groupedFaqs = faqs.reduce((acc: any, faq: any) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {});

  return (
    <section className="faq-bg" id="faq">
      <div className="section centered">
        <h2 className="section-title">Common questions</h2>
        <p className="section-desc">
          Everything you need to know about The Fur Finder.
        </p>

        {Object.keys(groupedFaqs).length > 0 ? (
          <>
            {Object.entries(groupedFaqs).map(
              ([category, categoryFaqs]: [string, any]) => (
                <div key={category} className="mb-12">
                  <h3 className="text-xl font-semibold mb-6 text-[#1a1a2e]">
                    {category}
                  </h3>
                  <div className="faq-list">
                    {categoryFaqs.map((faq: any) => (
                      <details key={faq.id}>
                        <summary>
                          {faq.question}
                          <span className="faq-icon">+</span>
                        </summary>
                        <div className="faq-answer">{faq.answer}</div>
                      </details>
                    ))}
                  </div>
                </div>
              ),
            )}
          </>
        ) : (
          <p className="text-[#6b7280]">No FAQs available at the moment.</p>
        )}
      </div>
    </section>
  );
}
