import Link from 'next/link'
import { PawPrint } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PetCardAnimal {
  id: string
  pet_name: string
  pet_type: string
  breed: string
  age?: string | null
  gender?: string | null
  size: string
  color: string
  photo_uris: string[]
  org_name?: string
}

export function PetCard({ animal, featured, className }: { animal: PetCardAnimal; featured?: boolean; className?: string }) {
  const photo = animal.photo_uris?.[0]
  const tags = [animal.breed, animal.age, animal.gender].filter(Boolean)

  return (
    <Link
      href={`/adoption/${animal.id}`}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border-[1.5px] border-forest/15 bg-forest transition-colors hover:border-forest/35',
        featured ? 'aspect-[16/10] md:aspect-[21/9]' : 'aspect-[4/5]',
        className
      )}
    >
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt={animal.pet_name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-expo group-hover:scale-[1.04]"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-forest">
          <PawPrint size={featured ? 64 : 44} className="text-cream/15" strokeWidth={1.5} />
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-forest/95 via-forest/30 to-transparent" />

      <div className="relative mt-auto flex flex-col gap-1.5 p-4">
        <span className="inline-flex w-fit rounded-full border-[1.5px] border-leaf/50 bg-leaf/15 px-2.5 py-0.5 font-body text-[10.5px] font-bold capitalize text-leaf">
          {animal.pet_type}
        </span>
        <h3 className={cn('font-display italic leading-tight text-cream', featured ? 'text-[26px]' : 'text-[19px]')}>
          {animal.pet_name || 'Unnamed'}
        </h3>
        {tags.length > 0 ? (
          <p className="font-body text-[12.5px] capitalize text-cream/70">{tags.join(' · ')}</p>
        ) : null}
        {animal.org_name ? (
          <p className="font-body text-[11px] font-semibold uppercase tracking-wide text-cream/65">{animal.org_name}</p>
        ) : null}
      </div>
    </Link>
  )
}
