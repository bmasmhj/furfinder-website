import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing - The Fur Finder",
  description:
    "Simple, honest pricing for The Fur Finder. Core app is free, premium unlocks AI-powered features.",
};

import { db } from "@/lib/db";

async function getPricingPlans() {
  try {
    const plans = await db.queryMany(
      'SELECT * FROM pricing_plans WHERE is_active = true ORDER BY display_order ASC'
    );
    return plans || [];
  } catch (error) {
    console.error("Error fetching pricing:", error);
    return [];
  }
}



export default async function Pricing() {
  const plans = await getPricingPlans();

  return (
    <section className="pricing-bg max-w-7xl m-auto" id="pricing">
      <div className="section centered">
        <h2 className="section-title">Simple, honest pricing</h2>
        <p className="section-desc">
          The core app is completely free. Premium unlocks AI-powered features
          for those who want every possible advantage finding their pet.
        </p>

        {plans.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
              {plans.map((plan: any) => (
                <div
                  key={plan.id}
                  className={`plan-card ${plan.is_popular ? "featured" : ""} flex flex-col justify-between`}
                >
                  <div>
                    {plan.is_popular && (
                      <div className="plan-badge">Most Popular</div>
                    )}
                    <div className="plan-name">{plan.name}</div>
                    <div
                      className={`plan-price ${plan.name.toLowerCase() === "free" ? "free-price" : ""}`}
                    >
                      {plan.name.toLowerCase() === "free" ? (
                        "Free"
                      ) : (
                        <h3 className="text-6xl">
                          <sup>$</sup>
                          {plan.price_aud}
                          <span>/{plan.billing_period}</span>
                        </h3>
                      )}
                    </div>
                    <div className="plan-yearly">{plan.description}</div>
                    <div className="plan-divider"></div>

                    {Array.isArray(plan.features)
                      ? plan.features.map((feature: string, idx: number) => (
                          <div key={idx} className="plan-feature">
                            <span
                              className={
                                feature.includes("✓")
                                  ? "plan-check"
                                  : "plan-cross"
                              }
                            >
                              {feature.includes("✓") ? "✓" : "–"}
                            </span>
                            {feature.replace("✓ ", "").replace("– ", "")}
                          </div>
                        ))
                      : null}
                  </div>

                  <a
                    href="https://apps.apple.com/app/id6759967208"
                    className={`plan-btn ${
                      plan.name.toLowerCase() === "free"
                        ? "plan-btn-free"
                        : "plan-btn-premium"
                    }`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {plan.name.toLowerCase() === "free"
                      ? "Get Started Free"
                      : "Start Premium Trial"}
                  </a>
                </div>
              ))}
            </div>
            <p className="pricing-note !mt-16">
              Subscriptions managed securely via the App Store &amp; Google
              Play. Cancel anytime.
            </p>
          </>
        ) : (
          <p className="text-center text-[#6b7280]">
            No pricing plans available at the moment.
          </p>
        )}
      </div>
    </section>
  );
}
