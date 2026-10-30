"use client";

import { useEffect, useState } from "react";
import { waLink } from "@/lib/site";

const links = [
  { href: "#tentang", label: "Tentang" },
  { href: "#keunggulan", label: "Keunggulan" },
  { href: "#paket", label: "Paket Aqiqah" },
  { href: "#nasi-box", label: "Nasi Box" },
  { href: "#bundling", label: "Bundling" },
  { href: "#testimoni", label: "Testimoni" },
  { href: "#faq", label: "FAQ" },
];

export function Navbar({ waNumber, siteName, logo }: { waNumber: string; siteName: string; logo: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav${scrolled ? " scrolled" : ""}`}>
      <div className="container nav__inner">
        <a href="#" className="brand" aria-label={`${siteName} — beranda`}>
          {/* Logo bisa hasil upload dengan rasio bebas, jadi pakai <img> dengan tinggi tetap dari CSS. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} alt={siteName} fetchPriority="high" />
        </a>
        <nav className={`nav__links${open ? " open" : ""}`}>
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
        </nav>
        <a href={waLink(waNumber)} target="_blank" rel="noopener" className="btn btn--gold btn--sm nav__cta">
          Pesan Sekarang
        </a>
        <button className="nav__toggle" aria-label="Buka menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
