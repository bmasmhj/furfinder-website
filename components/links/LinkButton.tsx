"use client";

import { useState } from "react";
import { icons, Link as LinkIcon, type LucideIcon } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api/v1/";

function resolveIcon(name: string | null): LucideIcon {
  if (!name) return LinkIcon;
  return (icons as Record<string, LucideIcon>)[name] || LinkIcon;
}

export default function LinkButton({
  id,
  name,
  url,
  icon,
}: {
  id: string;
  name: string;
  url: string;
  icon: string | null;
}) {
  const [copied, setCopied] = useState(false);
  const Icon = resolveIcon(icon);

  function handleClick() {
    fetch(`${API_BASE_URL}links/${id}/click`, { method: "POST" }).catch(() => {});
  }

  function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: name, url }).catch(() => {});
      return;
    }
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  return (
    <div className="group relative flex w-full items-center overflow-hidden rounded-2xl bg-forest text-cream shadow-sm transition hover:brightness-110">
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        onClick={handleClick}
        className="flex flex-1 items-center gap-3 px-5 py-4"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-cream/10">
          <Icon className="size-4 text-amber" />
        </span>
        <span className="font-body text-sm font-bold">{name}</span>
      </a>
      <button
        type="button"
        aria-label={`Share ${name}`}
        onClick={handleShare}
        className="shrink-0 px-4 py-4 text-cream/50 opacity-0 transition group-hover:opacity-100"
      >
        {copied ? (
          <span className="font-body text-xs font-bold text-leaf-text">Copied!</span>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" className="size-4">
            <path
              d="M18 8a3 3 0 1 0-2.83-4H15a3 3 0 0 0 .05 3.11L8.91 10.7a3 3 0 1 0 0 2.6l6.14 3.59A3 3 0 1 0 16 15l-6.09-3.55a3 3 0 0 0 0-.9L16 7A3 3 0 0 0 18 8Z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
