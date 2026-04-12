"use client";

import { Hamburger, HamburgerIcon, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/pricing", label: "Pricing" },
    { href: "/blog", label: "Blog" },
  ];

  return (
    <>
      <div className={`nav-wrap${scrolled ? " nav-wrap--scrolled" : ""}`}>
        <nav
          className="nav max-w-7xl mx-auto px-6"
          style={{ padding: "14px 24px" }}
        >
          {/* Logo */}
          <Link href="/" className="nav-logo">
            <span className="paw">🐾</span> The Fur Finder
          </Link>

          {/* Desktop nav */}
          <div className="nav-links nav-links--desktop">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`nav-link${isActive(href) ? " nav-link--active" : ""}`}
              >
                {label}
              </Link>
            ))}
            <Link href="https://app.thefurfinder.com" className="nav-cta !px-3 hidden md:inline-flex hover:!text-white ">
              Try on Web 
            </Link>
          </div>

          {/* Hamburger button (mobile only) */}
          <button
            className="nav-hamburger"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
              <Menu size={20} className="dark:text-white" />
          </button>
        </nav>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />
      )}
      <div
        className={`mobile-drawer${mobileOpen ? " mobile-drawer--open" : ""}`}
      >
        <div className="mobile-drawer-inner">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`mobile-nav-link${isActive(href) ? " mobile-nav-link--active" : ""}`}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/#download"
            className="mobile-nav-cta"
            onClick={() => setMobileOpen(false)}
          >
            Download Free
          </Link>
        </div>
      </div>
    </>
  );
}
