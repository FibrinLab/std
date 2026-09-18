"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navLinks } from "@/lib/content";

// Floats clear over the hero, settles onto an ivory bar once the page scrolls, and marks the section in view.
// `home` is set by the page that owns the "#…" sections; elsewhere those links lead back to it.
export function SiteNav({ home = false }: { home?: boolean }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!home) return;
    const sections = navLinks.filter((link) => link.href.startsWith("#")).map((link) => document.getElementById(link.href.slice(1))).filter((node): node is HTMLElement => node !== null);
    // A section counts as "in view" while it crosses a thin band just under the bar.
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
        else setActive((current) => current === entry.target.id ? null : current);
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [home]);

  return <nav className={`flo-nav${scrolled ? " is-scrolled" : ""}`} aria-label="Site">
    <ul>{navLinks.map((link) => <li key={link.href}>
      {link.href.startsWith("#")
        ? home
          ? <a className="flo-caps" href={link.href} aria-current={active === link.href.slice(1) ? "true" : undefined}>{link.label}</a>
          : <Link className="flo-caps" href={`/${link.href}`}>{link.label}</Link>
        : <Link className="flo-caps" href={link.href} aria-current={pathname === link.href ? "page" : undefined}>{link.label}</Link>}
    </li>)}</ul>
  </nav>;
}
