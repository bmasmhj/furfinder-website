import Link from "next/link";

export default function PetStory({ featured ,  story }: { featured?: boolean; story: any }) {
  return (
    <Link
      href={`/reunited-stories/${story.id}`}
      key={story.id}
      className={`overflow-hidden rounded-2xl border border-border bg-card transition-all hover:shadow-lg hover:-translate-y-0.5 ${featured ? "border-primary" : ""}`}
    >
      {story.image_url && (
        <div className="h-48 overflow-hidden bg-muted">
          <img
            src={story.image_url}
            alt={story.pet_name}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {story.pet_type}
          </span>
        </div>
        <h3 className="mb-2 text-lg font-bold text-foreground">
          {story.pet_name}&apos;s Journey
        </h3>
        <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
          {story.story_content}
        </p>
        <p className="text-xs text-muted-foreground">
          Reunited:{" "}
          {story.reunited_date
            ? new Date(story.reunited_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
              })
            : "Recently"}
        </p>
      </div>
    </Link>
  );
}
