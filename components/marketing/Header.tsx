"use client";

import { Menu, PawPrint, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/adoption", label: "Adopt" },
    { href: "/detect-breed", label: "Detect Breed" },
    { href: "/partners", label: "Partners" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/blog", label: "Blog" },
  ];

  return (
    <>
      <div
        className={cn(
          "sticky top-0 z-50 border-b border-forest/10 bg-cream transition-shadow",
          scrolled && "shadow-[0_1px_0_hsl(var(--forest)/0.08),0_12px_24px_-20px_hsl(var(--forest)/0.4)]"
        )}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-forest/20 text-forest">
              <PawPrint className="h-[18px] w-[18px]" strokeWidth={2} />
            </span>
            <span className="font-display text-[19px] italic tracking-[-0.01em] text-forest">
              The Fur Finder
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative py-2 font-body text-[14.5px] font-medium transition-colors hover:text-forest",
                  isActive(href) ? "text-forest" : "text-forest/75"
                )}
              >
                {label}
                {isActive(href) && (
                  <span className="absolute -bottom-0.5 left-0 h-[3px] w-full rounded-full bg-amber" />
                )}
              </Link>
            ))}
            <Link
              href="https://app.thefurfinder.com"
              className="rounded-xl bg-forest px-5 py-2.5 font-body text-[14px] font-semibold text-cream transition-transform hover:-translate-y-0.5"
            >
              Try on Web
            </Link>
            <ThemeToggle />
          </div>

          {/* Mobile controls */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full text-forest hover:bg-forest/10"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[999] bg-forest/45"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed right-0 top-0 z-[1000] h-full w-4/5 max-w-[300px] bg-cream shadow-2xl transition-transform duration-300 ease-expo",
          mobileOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col gap-1 px-6 pt-20">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "border-b border-forest/10 py-3.5 font-display text-xl italic transition-colors",
                isActive(href) ? "text-coral-text" : "text-forest"
              )}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/download"
            className="mt-6 rounded-xl bg-amber py-4 text-center font-body font-bold text-forest"
            onClick={() => setMobileOpen(false)}
          >
            Get the App
          </Link>
        </div>
      </div>
    </>
  );
}
