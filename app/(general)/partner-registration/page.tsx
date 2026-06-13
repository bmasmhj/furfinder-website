import type { Metadata } from "next";
import Link from "next/link";
import PartnerInterestFunnel from "@/components/marketing/PartnerInterestFunnel";

export const metadata: Metadata = {
  title: "Partner With The Fur Finder - Partner Intake",
  description:
    "Start the partner intake for veterinary clinics, shelters, rescues, and community organisations that want to join The Fur Finder network.",
};

export default function PartnerRegistrationPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-teal-50/40 to-orange-50/30 py-20 dark:via-teal-950/10 dark:to-orange-950/10">
      <section className="px-6 text-center md:px-8">
        <div className="mx-auto max-w-3xl">
          <span className="inline-flex rounded-full bg-teal-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-teal-600 dark:text-teal-400">
            Partner With Us
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-[-0.05em] text-foreground md:text-6xl">
            Join The Fur Finder partner network
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-muted-foreground">
            This intake is for legitimate veterinary clinics, shelters, rescue organisations, councils, and established animal-welfare or community organisations.
          </p>
        </div>
      </section>

      <section className="mx-auto mt-12 grid max-w-6xl gap-5 px-6 md:grid-cols-2 lg:grid-cols-4 md:px-8">
        {[
          {
            title: "Eligibility",
            body: "Applicants must be authorised to represent the organisation and use the network for legitimate animal care, reunification, or community-service purposes.",
          },
          {
            title: "Verification & approval",
            body: "We may verify registration, licences, domain ownership, contact details, and public records. Submitting an application does not guarantee approval or listing.",
          },
          {
            title: "How data is used",
            body: "Application data is used to assess eligibility, contact the organisation, prevent abuse, onboard approved partners, and maintain directory accuracy.",
          },
          {
            title: "Content moderation",
            body: "Organisation profiles, reports, links, and other content may be reviewed, corrected, limited, removed, or suspended for safety, accuracy, legality, or policy compliance.",
          },
        ].map((item) => (
          <article key={item.title} className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-bold text-foreground">{item.title}</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.body}</p>
          </article>
        ))}
      </section>

      <p className="mx-auto mt-6 max-w-3xl px-6 text-center text-sm leading-7 text-muted-foreground md:px-8">
        External organisation links must be valid public <strong>https://</strong> destinations. Dangerous schemes and private-network links are rejected. Report a malicious or misleading partner destination through{" "}
        <Link href="/support" className="font-semibold text-primary hover:underline">Support</Link>.
      </p>

      <div className="mt-12">
        <PartnerInterestFunnel />
      </div>

      <section className="px-6 pb-16 text-center md:px-8">
        <p className="text-sm text-muted-foreground">
          Looking for advertising instead? Visit{" "}
          <Link href="/advertise" className="font-semibold text-primary hover:underline">
            advertise options
          </Link>{" "}
          or contact the team directly.
        </p>
      </section>
    </main>
  );
}
