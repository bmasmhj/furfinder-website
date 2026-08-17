"use client";

export default function CopyButton({ text }: { text: string }) {
  return (
    <button
      className="shrink-0 rounded-lg bg-amber px-4 py-1.5 font-body text-xs font-bold text-forest transition hover:brightness-95"
      onClick={() => {
        if (typeof navigator !== "undefined") {
          navigator.clipboard.writeText(text);
        }
      }}
    >
      Copy
    </button>
  );
}