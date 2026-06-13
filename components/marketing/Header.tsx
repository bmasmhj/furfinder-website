"use client";

import { Menu, X } from "lucide-react";
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
    { href: "/how-it-works", label: "How It Works" },
    { href: "/partner-registration", label: "Partners" },
    { href: "/pricing", label: "Pricing" },
    { href: "/blog", label: "Blog" },
  ];

  return (
    <>
      <div
        className={cn(
          "sticky top-0 z-50 border-b border-border/70 bg-background/92 backdrop-blur-xl transition-shadow",
          scrolled && "shadow-sm"
        )}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-foreground">
            <span className="text-xl text-primary">🐾</span> The Fur Finder
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-7 md:flex">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative py-2 text-sm font-medium transition-colors hover:text-primary",
                  isActive(href) ? "font-bold text-primary" : "text-muted-foreground"
                )}
              >
                {label}
                {isActive(href) && (
                  <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-primary" />
                )}
              </Link>
            ))}
            <Link
              href="https://app.thefurfinder.com"
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              Try on Web
            </Link>
            <ThemeToggle />
          </div>

          {/* Mobile controls */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted"
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
          className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed right-0 top-0 z-[1000] h-full w-4/5 max-w-[300px] bg-background shadow-2xl transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col gap-4 px-6 pt-20">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "border-b border-border pb-3 text-lg font-semibold transition-colors",
                isActive(href) ? "text-primary" : "text-foreground"
              )}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/download"
            className="mt-5 rounded-xl bg-primary py-4 text-center font-bold text-white"
            onClick={() => setMobileOpen(false)}
          >
            Get the App
          </Link>
        </div>
      </div>
    </>
  );
}
