import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { PetCard, type PetCardAnimal } from "@/components/adoption/PetCard";
import { isSafeHttpsUrl } from "@/lib/external-url";
import { ArrowLeft, Building2, Globe, Phone, Mail, MapPin, PawPrint, Megaphone } from "lucide-react";

interface OrgDetail {
  id: string;
  name: string;
  type: string;
  address: string;
  phone: string;
  email: string;
  website: string | null;
  description: string | null;
  logo_uri: string | null;
}

interface AnimalRow {
  id: string;
  pet_name: string;
  pet_type: string;
  breed: string;
  age: string | null;
  gender: string | null;
  size: string;
  color: string;
  photo_uris: unknown;
}

interface AdRow {
  id: string;
  business_name: string;
  description: string | null;
  image_uri: string;
  logo_uri: string | null;
  link_url: string | null;
}

function parsePhotoUris(value: unknown): string[] {
  if (Array.isArray(value)) return value as string[];
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  }
  return [];
}

async function getOrg(id: string): Promise<OrgDetail | null> {
  return db.queryOne<OrgDetail>(
    `SELECT id, name, type, address, phone, email, website, description, logo_uri
     FROM organisations WHERE id = $1 AND status = 'approved' AND deleted_at IS NULL`,
    [id]
  );
}

async function getOrgAnimals(orgId: string): Promise<AnimalRow[]> {
  return db.queryMany<AnimalRow>(
    `SELECT id, pet_name, pet_type, breed, age, gender, size, color, photo_uris
     FROM organisation_animals
     WHERE org_id = $1 AND status = 'available' AND deleted_at IS NULL
     ORDER BY created_at DESC`,
    [orgId]
  );
}

async function getOrgAds(orgId: string): Promise<AdRow[]> {
  return db.queryMany<AdRow>(
    `SELECT id, business_name, description, image_uri, logo_uri, link_url
     FROM ads
     WHERE org_id = $1 AND status = 'approved' AND deleted_at IS NULL AND (end_date IS NULL OR end_date > NOW())
     ORDER BY created_at DESC`,
    [orgId]
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const org = await getOrg(id);
  if (!org) {
    return { title: "Partner Not Found - The Fur Finder" };
  }
  const title = `${org.name} - The Fur Finder Partners`;
  const description = org.description || `${org.name} is a ${org.type} partnering with The Fur Finder.`;
  return { title, description, openGraph: { title, description, type: "website" } };
}

export default async function PartnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const org = await getOrg(id);

  if (!org) {
    notFound();
  }

  const [animalRows, adRows] = await Promise.all([getOrgAnimals(org.id), getOrgAds(org.id)]);

  const animals: PetCardAnimal[] = animalRows.map((a) => ({
    id: a.id,
    pet_name: a.pet_name,
    pet_type: a.pet_type,
    breed: a.breed,
    age: a.age,
    gender: a.gender,
    size: a.size,
    color: a.color,
    photo_uris: parsePhotoUris(a.photo_uris),
  }));

  const hasSafeWebsite = org.website ? isSafeHttpsUrl(org.website) : false;

  return (
    <div className="bg-cream text-forest">
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-16">
        <div className="mb-6 md:mb-8">
          <Link
            href="/partners"
            className="group inline-flex items-center gap-2 font-body text-sm font-semibold text-forest/70 transition-colors hover:text-forest"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Back to Partners
          </Link>
        </div>

        {/* Org header */}
        <div className="overflow-hidden rounded-[20px] border-[1.5px] border-forest/15 bg-card">
          <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:p-10">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-[1.5px] border-forest/15 md:h-28 md:w-28">
              {org.logo_uri ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={org.logo_uri} alt={org.name} className="h-full w-full object-cover" />
              ) : (
                <Building2 size={36} className="text-forest/30" />
              )}
            </div>
            <div className="flex-1">
              <span className="inline-flex rounded-full border-[1.5px] border-leaf/40 bg-leaf/10 px-2.5 py-0.5 font-body text-[11px] font-bold capitalize text-leaf-text">
                {org.type}
              </span>
              <h1 className="mt-2 font-display text-[30px] italic leading-tight text-forest md:text-[36px]">
                {org.name}
              </h1>
              <p className="mt-2 flex items-start gap-1.5 font-body text-sm text-forest/70">
                <MapPin size={16} className="mt-0.5 shrink-0" />
                {org.address}
              </p>
            </div>
          </div>

          {org.description ? (
            <div className="border-t border-forest/10 p-6 md:p-10 md:pt-6">
              <p className="font-body text-sm leading-relaxed text-forest/75 md:text-[15px]">
                {org.description}
              </p>
            </div>
          ) : null}

          {/* Contact / donate */}
          <div className="flex flex-col gap-3 border-t border-forest/10 bg-muted/40 p-6 md:flex-row md:flex-wrap md:items-center md:gap-6 md:p-10 md:py-6">
            {hasSafeWebsite ? (
              <a
                href={org.website!}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 rounded-xl bg-amber px-5 py-2.5 font-body text-sm font-bold text-forest"
              >
                <Globe size={16} />
                Visit site to donate or inquire
              </a>
            ) : null}
            {org.phone ? (
              <span className="inline-flex items-center gap-2 font-body text-sm font-medium text-forest">
                <Phone size={16} className="text-forest/60" />
                {org.phone}
              </span>
            ) : null}
            {org.email ? (
              <span className="inline-flex items-center gap-2 font-body text-sm font-medium text-forest">
                <Mail size={16} className="text-forest/60" />
                {org.email}
              </span>
            ) : null}
          </div>
        </div>

        {/* Pets available for adoption */}
        <div className="mt-12">
          <h2 className="mb-5 flex items-center gap-2 font-display text-[22px] italic text-forest md:text-[26px]">
            <PawPrint size={20} className="text-forest/60" strokeWidth={1.75} />
            Pets available for adoption
          </h2>
          {animals.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {animals.map((animal) => (
                <PetCard key={animal.id} animal={animal} />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border-[1.5px] border-dashed border-forest/15 py-10 text-center font-body text-sm text-forest/70">
              {org.name} doesn&apos;t have any pets listed for adoption right now.
            </p>
          )}
        </div>

        {/* Ads */}
        {adRows.length > 0 ? (
          <div className="mt-12">
            <h2 className="mb-5 flex items-center gap-2 font-display text-[22px] italic text-forest md:text-[26px]">
              <Megaphone size={20} className="text-forest/60" strokeWidth={1.75} />
              From {org.name}
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {adRows.map((ad) => (
                <PartnerAdCard key={ad.id} ad={ad} />
              ))}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

function PartnerAdCard({ ad }: { ad: AdRow }) {
  const safeAdLink = ad.link_url && isSafeHttpsUrl(ad.link_url) ? ad.link_url : null;
  const image = ad.image_uri || ad.logo_uri;

  const content = (
    <>
      {image ? (
        <div className="aspect-[16/9] w-full bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={ad.business_name} className="h-full w-full object-cover" />
        </div>
      ) : null}
      <div className="p-4">
        <h3 className="font-bold text-foreground">{ad.business_name}</h3>
        {ad.description ? <p className="mt-1 text-sm text-muted-foreground">{ad.description}</p> : null}
      </div>
    </>
  );

  const className =
    "flex flex-col overflow-hidden rounded-2xl border-[1.5px] border-forest/15 bg-card transition-colors hover:border-forest/35";

  if (safeAdLink) {
    return (
      <a href={safeAdLink} target="_blank" rel="noreferrer noopener" className={className}>
        {content}
      </a>
    );
  }

  return <div className={className}>{content}</div>;
}
