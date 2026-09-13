import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { isSafeHttpsUrl } from "@/lib/external-url";
import {
  ArrowLeft,
  PawPrint,
  Tag,
  Cake,
  Ruler,
  Palette,
  VenetianMask,
  Building2,
  Globe,
  Phone,
  Mail,
} from "lucide-react";

interface AnimalDetail {
  id: string;
  pet_name: string;
  pet_type: string;
  breed: string;
  age: string | null;
  gender: string | null;
  size: string;
  color: string;
  markings: string;
  description: string;
  photo_uris: unknown;
  org_id: string;
  org_name: string;
  org_logo_uri: string | null;
  org_website: string | null;
  org_phone: string;
  org_email: string;
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

async function getAnimal(id: string): Promise<AnimalDetail | null> {
  return db.queryOne<AnimalDetail>(
    `SELECT oa.id, oa.pet_name, oa.pet_type, oa.breed, oa.age, oa.gender, oa.size, oa.color, oa.markings, oa.description, oa.photo_uris,
            o.id AS org_id, o.name AS org_name, o.logo_uri AS org_logo_uri, o.website AS org_website, o.phone AS org_phone, o.email AS org_email
     FROM organisation_animals oa
     JOIN organisations o ON o.id = oa.org_id
     WHERE oa.id = $1 AND oa.status = 'adopt' AND oa.deleted_at IS NULL AND o.status = 'approved' AND o.deleted_at IS NULL`,
    [id]
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const animal = await getAnimal(id);
  if (!animal) {
    return { title: "Pet Not Found - The Fur Finder" };
  }
  const title = `Adopt ${animal.pet_name || animal.pet_type} - The Fur Finder`;
  const description = `Meet ${animal.pet_name || "this pet"}, a ${animal.breed || animal.pet_type} available for adoption through ${animal.org_name}.`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
  };
}

export default async function AdoptionPetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const animal = await getAnimal(id);

  if (!animal) {
    notFound();
  }

  const photos = parsePhotoUris(animal.photo_uris);
  const [mainPhoto, ...restPhotos] = photos;
  const hasSafeWebsite = animal.org_website ? isSafeHttpsUrl(animal.org_website) : false;
  const stats = [
    { icon: Tag, label: "Breed", value: animal.breed },
    { icon: Cake, label: "Age", value: animal.age },
    { icon: Ruler, label: "Size", value: animal.size },
    { icon: VenetianMask, label: "Gender", value: animal.gender },
    { icon: Palette, label: "Color", value: animal.color },
  ].filter((s) => s.value);

  return (
    <div className="bg-cream text-forest">
      {/* Photo banner */}
      <section className="relative aspect-[16/9] w-full overflow-hidden bg-forest md:aspect-[21/9]">
        {mainPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mainPhoto} alt={animal.pet_name} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <PawPrint size={96} className="text-cream/15" strokeWidth={1.5} />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/10 to-transparent" />

        <div className="absolute inset-x-0 top-0 px-6 pt-6 md:px-10 md:pt-8">
          <Link
            href="/adoption"
            className="group inline-flex items-center gap-2 font-body text-sm font-semibold text-cream/85 transition-colors hover:text-cream"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Back to Adoption
          </Link>
        </div>

        <div className="absolute inset-x-0 bottom-0 px-6 pb-6 md:px-10 md:pb-10">
          <div className="mx-auto flex max-w-6xl items-end justify-between gap-4">
            <div>
              <span className="inline-flex rounded-full border-[1.5px] border-leaf/50 bg-leaf/15 px-3 py-1 font-body text-[11px] font-bold uppercase tracking-widest text-leaf">
                Available · {animal.pet_type}
              </span>
              <h1 className="mt-2 font-display text-[40px] italic leading-[1.05] text-cream md:text-[56px]">
                {animal.pet_name || "Unnamed"}
              </h1>
            </div>
          </div>
        </div>
      </section>

      {restPhotos.length > 0 ? (
        <div className="mx-auto max-w-6xl px-6 pt-4">
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
            {restPhotos.slice(0, 6).map((photo, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={photo + i}
                src={photo}
                alt={`${animal.pet_name} photo ${i + 2}`}
                className="aspect-square w-full rounded-xl border-[1.5px] border-forest/15 object-cover"
              />
            ))}
          </div>
        </div>
      ) : null}

      <main className="mx-auto max-w-6xl px-6 py-10 md:py-14">
        {/* Stat strip */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 border-y border-forest/10 py-6 sm:grid-cols-3 md:grid-cols-5">
          {stats.map((s) => (
            <div key={s.label} className="flex items-start gap-2.5">
              <s.icon size={18} className="mt-0.5 shrink-0 text-forest/60" strokeWidth={1.75} />
              <div>
                <p className="font-body text-[10.5px] font-bold uppercase tracking-[0.1em] text-forest/75">{s.label}</p>
                <p className="font-body text-sm font-bold capitalize leading-tight text-forest">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_300px]">
          <article>
            <h2 className="font-display text-[22px] italic text-forest">About {animal.pet_name || "this pet"}</h2>
            <p className="mt-3 font-body text-[15px] leading-relaxed text-forest/80">
              {animal.description || "No additional description provided."}
            </p>

            {animal.markings ? (
              <div className="mt-8 border-t border-forest/10 pt-6">
                <p className="mb-2 font-body text-[11px] font-bold uppercase tracking-widest text-forest/75">
                  Distinctive Markings
                </p>
                <p className="font-body leading-relaxed text-forest/85">{animal.markings}</p>
              </div>
            ) : null}
          </article>

          <aside className="space-y-5">
            <section className="rounded-[20px] border-[1.5px] border-forest/15 bg-card p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border-[1.5px] border-forest/15">
                  {animal.org_logo_uri ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={animal.org_logo_uri}
                      alt={animal.org_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Building2 size={22} className="text-forest/40" strokeWidth={1.75} />
                  )}
                </div>
                <div>
                  <p className="font-body text-[11px] font-bold uppercase tracking-widest text-forest/75">
                    Listed by
                  </p>
                  <Link href={`/partners/${animal.org_id}`} className="font-display text-[17px] italic text-forest hover:text-coral-text">
                    {animal.org_name}
                  </Link>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2 border-t border-forest/10 pt-4 font-body text-sm text-forest/75">
                {hasSafeWebsite ? (
                  <a
                    href={animal.org_website!}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-2 font-semibold text-forest underline decoration-amber decoration-2 underline-offset-4 hover:text-coral-text"
                  >
                    <Globe size={16} />
                    Visit {animal.org_name}&apos;s site to donate or inquire
                  </a>
                ) : null}
                {animal.org_phone ? (
                  <span className="inline-flex items-center gap-2">
                    <Phone size={16} />
                    {animal.org_phone}
                  </span>
                ) : null}
                {animal.org_email ? (
                  <span className="inline-flex items-center gap-2">
                    <Mail size={16} />
                    {animal.org_email}
                  </span>
                ) : null}
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
