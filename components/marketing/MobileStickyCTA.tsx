"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PawPrint, Search } from "lucide-react";
import { downloadApp } from "@/lib/downloadHandler";

export default function MobileStickyCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-forest/10 bg-cream px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_28px_-16px_hsl(var(--forest)/0.35)] transition-transform duration-300 ease-expo md:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      role="region"
      aria-label="Quick actions"
    >
      <Link
        href={downloadApp("")}
        className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-amber px-4 py-3.5 text-[15px] font-bold text-forest active:scale-[0.98]"
      >
        <PawPrint className="h-[18px] w-[18px]" strokeWidth={2.25} />
        Report a Lost Pet
      </Link>
      <a
        href="https://app.thefurfinder.com"
        className="flex items-center justify-center gap-2 rounded-2xl border-[1.5px] border-forest/25 px-4 py-3.5 text-[15px] font-bold text-forest active:scale-[0.98]"
      >
        <Search className="h-[18px] w-[18px]" strokeWidth={2.25} />
      </a>
    </div>
  );
}
