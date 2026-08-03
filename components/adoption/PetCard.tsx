import Link from 'next/link'
import { PawPrint } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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

export function PetCard({ animal, className }: { animal: PetCardAnimal; className?: string }) {
  const photo = animal.photo_uris?.[0]

  return (
    <Link
      href={`/adoption/${animal.id}`}
      className={cn(
        'group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg',
        className
      )}
    >
      <div className="relative aspect-[4/3] w-full bg-muted">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt={animal.pet_name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted/50">
            <PawPrint size={48} className="text-muted-foreground/20" />
          </div>
        )}
        <div className="absolute left-3 top-3">
          <Badge variant="coral" className="capitalize">
            {animal.pet_type}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-lg font-bold text-foreground">{animal.pet_name || 'Unnamed'}</h3>

        <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
          {animal.breed ? <span className="rounded-full bg-muted px-2 py-1 font-medium">{animal.breed}</span> : null}
          {animal.age ? <span className="rounded-full bg-muted px-2 py-1 font-medium">{animal.age}</span> : null}
          {animal.gender ? (
            <span className="rounded-full bg-muted px-2 py-1 font-medium capitalize">{animal.gender}</span>
          ) : null}
          {animal.size ? (
            <span className="rounded-full bg-muted px-2 py-1 font-medium capitalize">{animal.size}</span>
          ) : null}
        </div>

        {animal.org_name ? (
          <p className="mt-auto pt-2 text-xs font-semibold uppercase tracking-wide text-primary">
            {animal.org_name}
          </p>
        ) : null}
      </div>
    </Link>
  )
}
