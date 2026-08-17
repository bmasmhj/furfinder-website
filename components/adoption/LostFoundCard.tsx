import { MapPin, Calendar, Gift, PawPrint } from "lucide-react";

export interface LostFoundAnimal {
  id: string;
  pet_type: string;
  breed: string | null;
  color: string | null;
  status: "lost" | "found";
  location_name: string | null;
  found_location: string | null;
  last_seen_date: string | null;
  reward: string | null;
  photo_uris: string[];
}

export function LostFoundCard({ animal }: { animal: LostFoundAnimal }) {
  const photo = animal.photo_uris?.[0];
  const location = animal.location_name || animal.found_location;
  const isLost = animal.status === "lost";

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border-[1.5px] border-forest/15 bg-card">
      <div className="relative aspect-[4/3] w-full bg-muted">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={animal.pet_type} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <PawPrint size={40} className="text-forest/20" strokeWidth={1.75} />
          </div>
        )}
        <span
          className={`absolute left-3 top-3 rounded-full border-[1.5px] px-2.5 py-0.5 font-body text-[11px] font-bold capitalize ${
            isLost ? "border-coral/40 bg-coral/15 text-coral-text" : "border-leaf/40 bg-leaf/10 text-leaf-text"
          }`}
        >
          {animal.status}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-[17px] italic leading-tight text-forest capitalize">
          {animal.breed || animal.pet_type}
        </h3>
        {animal.color ? <p className="font-body text-[13px] text-forest/70 capitalize">{animal.color}</p> : null}

        <div className="mt-auto space-y-1.5 border-t border-forest/10 pt-3 font-body text-[12.5px] text-forest/70">
          {location ? (
            <p className="flex items-center gap-1.5">
              <MapPin size={14} className="shrink-0 text-forest/50" />
              {location}
            </p>
          ) : null}
          {animal.last_seen_date ? (
            <p className="flex items-center gap-1.5">
              <Calendar size={14} className="shrink-0 text-forest/50" />
              {animal.last_seen_date}
            </p>
          ) : null}
          {animal.reward ? (
            <p className="flex items-center gap-1.5 font-semibold text-forest">
              <Gift size={14} className="shrink-0 text-forest/50" />
              Reward: {animal.reward}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
