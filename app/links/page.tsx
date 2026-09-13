import type { Metadata } from "next";
import Image from "next/image";
import LinkButton from "@/components/links/LinkButton";

export const metadata: Metadata = {
  title: "Links - The Fur Finder",
  description: "All The Fur Finder links in one place.",
};

export const dynamic = "force-dynamic";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api/v1/";

interface PublicLink {
  id: string;
  name: string;
  url: string;
  icon: string | null;
  display_order: number;
}

async function getLinks(): Promise<PublicLink[]> {
  try {
    const res = await fetch(`${API_BASE_URL}links/active`, { cache: "no-store" });
    if (!res.ok) return [];
    const body = await res.json();
    return Array.isArray(body?.data) ? body.data : [];
  } catch {
    return [];
  }
}

export default async function LinksPage() {
  const links = await getLinks();

  return (
    <div className="flex min-h-screen justify-center bg-cream px-4 py-12">
      <div className="flex w-full max-w-md flex-col items-center gap-6">
        <div className="relative size-24 overflow-hidden rounded-full border-4 border-forest/10 bg-white shadow-sm">
          <Image src="/icon.png" alt="The Fur Finder" fill sizes="96px" className="object-cover" />
        </div>
        <h1 className="font-display text-2xl italic text-forest">@thefurfinder</h1>

        <div className="flex w-full flex-col gap-3">
          {links.length === 0 && (
            <p className="text-center font-body text-sm text-forest/60">No links yet — check back soon.</p>
          )}
          {links.map((link) => (
            <LinkButton key={link.id} id={link.id} name={link.name} url={link.url} icon={link.icon} />
          ))}
        </div>

        <p className="mt-4 font-body text-xs text-forest/40">The Fur Finder — every missing pet has a way home.</p>
      </div>
    </div>
  );
}
