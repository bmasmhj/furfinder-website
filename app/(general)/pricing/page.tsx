import type { Metadata } from "next";
import { db } from "@/lib/db";
import { Check, X } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing - The Fur Finder",
  description:
    "Simple, honest pricing for The Fur Finder. Core app is free, premium unlocks AI-powered features.",
};

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
    <section className="border-t border-border bg-gradient-to-b from-background to-orange-50/30 dark:to-orange-950/5" id="pricing">
      <div className="mx-auto max-w-7xl px-6 py-20 text-center">
        <h2 className="text-[30px] font-bold tracking-[-0.5px] text-foreground">
          Simple, honest pricing
        </h2>
        <p className="mx-auto mt-2.5 max-w-[580px] text-[15px] leading-[1.7] text-muted-foreground">
          The core app is completely free. Premium unlocks AI-powered features
          for those who want every possible advantage finding their pet.
        </p>

        {plans.length > 0 ? (
          <>
            <div className="mx-auto mt-10 grid max-w-[900px] grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan: any) => (
                <div
                  key={plan.id}
                  className={`relative flex flex-col justify-between rounded-[20px] border-2 bg-card p-7 ${
                    plan.is_popular
                      ? "border-primary shadow-[0_8px_32px_rgba(255,107,74,0.15)]"
                      : "border-border"
                  }`}
                >
                  <div>
                    {plan.is_popular && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-primary to-[#FF8A6E] px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                        Most Popular
                      </div>
                    )}
                    <div className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      {plan.name}
                    </div>
                    <div
                      className={`mb-1 text-[38px] font-extrabold tracking-[-1px] ${
                        plan.name.toLowerCase() === "free"
                          ? "text-[34px] text-emerald-500"
                          : "text-foreground"
                      }`}
                    >
                      {plan.name.toLowerCase() === "free" ? (
                        "Free"
                      ) : (
                        <h3 className="text-5xl">
                          <sup className="text-xl">$</sup>
                          {plan.price_aud}
                          <span className="text-sm font-normal text-muted-foreground">
                            /{plan.billing_period}
                          </span>
                        </h3>
                      )}
                    </div>
                    <div className="mb-5 text-xs text-muted-foreground">
                      {plan.description}
                    </div>
                    <div className="my-5 h-px bg-border" />

                    {Array.isArray(plan.features)
                      ? plan.features.map((feature: string, idx: number) => (
                          <div key={idx} className="mb-2.5 flex items-start gap-2.5 text-[13px] text-foreground/80 last:mb-0">
                              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                            {feature}
                          </div>
                        ))
                      : null}
                  </div>

                  <Link
                    href="/join-testing"
                    className={`mt-6 block rounded-xl py-3 text-center text-sm font-semibold transition-all ${
                      plan.name.toLowerCase() === "free"
                        ? "bg-muted text-foreground hover:bg-muted/80"
                        : "bg-primary text-white shadow-[0_4px_12px_rgba(255,107,74,0.25)] hover:-translate-y-0.5 hover:bg-[#e5553a]"
                    }`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View current availability
                  </Link>
                </div>
              ))}
            </div>
            <p className="mt-16 text-[13px] text-muted-foreground">
              When subscriptions are offered, the price and renewal period are
              shown before purchase. Manage cancellation through the store
              account used to subscribe. Account deletion does not cancel a subscription.
            </p>
          </>
        ) : (
          <p className="mt-10 text-center text-muted-foreground">
            No pricing plans available at the moment.
          </p>
        )}
      </div>
    </section>
  );
}
