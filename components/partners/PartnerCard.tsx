import Link from "next/link";
import { MapPin, Building2 } from "lucide-react";

export interface PartnerCardOrg {
  id: string;
  name: string;
  type: string;
  logo_uri?: string | null;
  address: string;
  animal_count?: number;
  distance_km?: number | null;
}

export function PartnerCard({ org }: { org: PartnerCardOrg }) {
  return (
    <Link
      href={`/partners/${org.id}`}
      className="group flex flex-col gap-3 rounded-2xl border-[1.5px] border-forest/15 bg-card p-5 transition-colors hover:border-forest/35"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border-[1.5px] border-forest/15">
          {org.logo_uri ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={org.logo_uri} alt={org.name} className="h-full w-full object-cover" />
          ) : (
            <Building2 size={24} className="text-forest/40" />
          )}
        </div>
        <div className="min-w-0">
          <h3 className="truncate font-display text-[17px] italic leading-tight text-forest">{org.name}</h3>
          <span className="mt-1 inline-flex rounded-full border-[1.5px] border-leaf/40 bg-leaf/10 px-2.5 py-0.5 font-body text-[11px] font-bold capitalize text-leaf-text">
            {org.type}
          </span>
        </div>
      </div>

      <p className="flex items-start gap-1.5 font-body text-sm text-forest/70">
        <MapPin size={16} className="mt-0.5 shrink-0" />
        <span className="line-clamp-2">{org.address}</span>
      </p>

      <div className="mt-auto flex items-center justify-between border-t border-forest/10 pt-3 font-body text-xs font-semibold text-forest/75">
        <span>
          {org.animal_count ?? 0} pet{org.animal_count === 1 ? "" : "s"} available
        </span>
        {typeof org.distance_km === "number" ? <span>{org.distance_km.toFixed(1)} km away</span> : null}
      </div>
    </Link>
  );
}
