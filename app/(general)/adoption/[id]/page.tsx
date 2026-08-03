import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
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
     WHERE oa.id = $1 AND oa.status = 'available' AND oa.deleted_at IS NULL AND o.status = 'approved' AND o.deleted_at IS NULL`,
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-16">
        <div className="mb-6 md:mb-8">
          <Link
            href="/adoption"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Back to Adoption
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          {/* Photos */}
          <div>
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-muted md:rounded-3xl">
              {mainPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mainPhoto} alt={animal.pet_name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted/50">
                  <PawPrint size={80} className="text-muted-foreground/20" />
                </div>
              )}
              <div className="absolute left-4 top-4">
                <Badge variant="coral" className="px-4 py-1.5 text-sm font-black uppercase tracking-widest shadow-lg">
                  Available
                </Badge>
              </div>
            </div>

            {restPhotos.length > 0 ? (
              <div className="mt-3 grid grid-cols-4 gap-3">
                {restPhotos.slice(0, 4).map((photo, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={photo + i}
                    src={photo}
                    alt={`${animal.pet_name} photo ${i + 2}`}
                    className="aspect-square w-full rounded-xl border border-border object-cover"
                  />
                ))}
              </div>
            ) : null}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <div className="mb-2 flex items-center gap-2 text-primary">
              <PawPrint size={20} />
              <span className="text-xs font-bold uppercase tracking-wider md:text-sm">{animal.pet_type}</span>
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-foreground md:text-6xl">
              {animal.pet_name || "Unnamed"}
            </h1>

            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 md:gap-x-6 md:gap-y-6">
              <DetailItem icon={<Tag size={20} />} label="Breed" value={animal.breed || "Unknown"} />
              <DetailItem icon={<Cake size={20} />} label="Age" value={animal.age || "Unknown"} />
              <DetailItem icon={<Ruler size={20} />} label="Size" value={animal.size || "Unknown"} />
              <DetailItem
                icon={<VenetianMask size={20} />}
                label="Gender"
                value={animal.gender || "Unknown"}
              />
              <DetailItem icon={<Palette size={20} />} label="Color" value={animal.color || "Unknown"} />
            </div>

            {animal.markings ? (
              <div className="mt-6 border-t border-border pt-4 md:pt-6">
                <p className="mb-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground/70">
                  Distinctive Markings
                </p>
                <p className="font-semibold leading-relaxed text-foreground">{animal.markings}</p>
              </div>
            ) : null}

            <div className="mt-6 rounded-2xl bg-muted/40 p-4 md:p-6">
              <h3 className="mb-2 font-bold text-foreground">About {animal.pet_name || "this pet"}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground md:text-[15px]">
                {animal.description || "No additional description provided."}
              </p>
            </div>

            {/* Partner section */}
            <div className="mt-6 rounded-2xl border-2 border-primary/20 bg-primary/5 p-4 md:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-card">
                  {animal.org_logo_uri ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={animal.org_logo_uri}
                      alt={animal.org_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Building2 size={22} className="text-muted-foreground/40" />
                  )}
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-primary">
                    Listed by
                  </p>
                  <Link href={`/partners/${animal.org_id}`} className="font-bold text-foreground hover:text-primary">
                    {animal.org_name}
                  </Link>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
                {hasSafeWebsite ? (
                  <a
                    href={animal.org_website!}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-2 font-semibold text-primary hover:underline"
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
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 md:gap-4">
      <div className="mt-1 text-primary">{icon}</div>
      <div>
        <p className="mb-0.5 text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/70 md:text-[11px]">
          {label}
        </p>
        <p className="text-sm font-bold capitalize leading-tight text-foreground md:text-base">{value}</p>
      </div>
    </div>
  );
}
