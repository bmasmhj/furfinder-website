import type { Metadata } from "next";
import { Suspense } from "react";
import { Building2 } from "lucide-react";
import { db } from "@/lib/db";
import { PartnerCard, type PartnerCardOrg } from "@/components/partners/PartnerCard";
import { PartnerTypeFilter } from "@/components/partners/PartnerTypeFilter";
import Reveal from "@/components/marketing/Reveal";
import Magnetic from "@/components/marketing/Magnetic";

export const metadata: Metadata = {
  title: "Our Partners - The Fur Finder",
  description:
    "Meet the shelters, rescues and vets partnering with The Fur Finder to help pets find loving homes.",
};

interface OrgRow {
  id: string;
  name: string;
  type: string;
  logo_uri: string | null;
  address: string;
  animal_count: string | number;
}

async function getPartners(type?: string): Promise<OrgRow[]> {
  const conditions = ["o.status = 'approved'", "o.deleted_at IS NULL"];
  const params: string[] = [];
  if (type) {
    params.push(type);
    conditions.push(`o.type = $${params.length}`);
  }

  return db.queryMany<OrgRow>(
    `SELECT o.id, o.name, o.type, o.logo_uri, o.address,
            COUNT(oa.id) FILTER (WHERE oa.status = 'available' AND oa.deleted_at IS NULL) AS animal_count
     FROM organisations o
     LEFT JOIN organisation_animals oa ON oa.org_id = o.id
     WHERE ${conditions.join(" AND ")}
     GROUP BY o.id
     ORDER BY o.name`,
    params
  );
}

export default async function PartnersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const type = typeof params.type === "string" ? params.type : undefined;
  const orgs = await getPartners(type);

  const partners: PartnerCardOrg[] = orgs.map((o) => ({
    id: o.id,
    name: o.name,
    type: o.type,
    logo_uri: o.logo_uri,
    address: o.address,
    animal_count: Number(o.animal_count) || 0,
  }));

  return (
    <div className="bg-cream text-forest">
      <section className="relative overflow-hidden px-6 py-16 md:py-20">
        <div className="relative mx-auto max-w-3xl text-center">
          <Reveal as="h1" className="font-display text-[40px] italic leading-[1.1] tracking-[-0.02em] text-forest max-md:text-[30px]">
            Shelters &amp; rescues we work with
          </Reveal>
          <Reveal delay={60} className="mx-auto mt-4 max-w-xl font-body text-[16px] leading-relaxed text-forest/75">
            Every adoptable pet on The Fur Finder comes from one of our verified partner organisations.
          </Reveal>
          <Reveal delay={120} className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <Magnetic>
              <a
                href="https://partners.thefurfinder.com/partner/signup"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-amber px-6 py-3 font-body text-[15px] font-bold text-forest"
              >
                Become a partner
              </a>
            </Magnetic>
            <a
              href="https://partners.thefurfinder.com/partner/login"
              target="_blank"
              rel="noreferrer"
              className="font-body text-[14px] font-semibold text-forest underline decoration-amber decoration-2 underline-offset-4 hover:text-coral-text"
            >
              Partner login
            </a>
          </Reveal>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-4">
        <Suspense fallback={null}>
          <PartnerTypeFilter />
        </Suspense>

        <div className="mt-8">
          {partners.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {partners.map((org) => (
                <PartnerCard key={org.id} org={org} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
              <Building2 size={40} className="text-muted-foreground/30" />
              <p className="text-base font-semibold text-foreground">No partners found</p>
              <p className="max-w-sm text-sm text-muted-foreground">Try a different partner type.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
