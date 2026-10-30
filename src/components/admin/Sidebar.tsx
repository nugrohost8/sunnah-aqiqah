"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/(admin)/admin/actions";

const groups = [
  {
    title: "Utama",
    links: [
      { href: "/admin", label: "Dashboard" },
      { href: "/admin/pesanan", label: "Pesanan" },
    ],
  },
  {
    title: "Paket & Harga",
    links: [
      { href: "/admin/paket", label: "Paket Aqiqah" },
      { href: "/admin/nasi-box", label: "Nasi Box" },
      { href: "/admin/bundling", label: "Bundling Box" },
    ],
  },
  {
    title: "Konten",
    links: [
      { href: "/admin/testimoni", label: "Testimoni" },
      { href: "/admin/faq", label: "FAQ" },
      { href: "/admin/partner", label: "Partner" },
    ],
  },
  {
    title: "Pengaturan",
    links: [
      { href: "/admin/pengaturan", label: "Pengaturan Umum" },
      { href: "/admin/pengaturan/logo", label: "Logo & Favicon" },
      { href: "/admin/pengaturan/hero", label: "Hero Slider" },
      { href: "/admin/pengaturan/whatsapp", label: "WhatsApp Gateway" },
    ],
  },
];

export function Sidebar({ logo, siteName }: { logo: string; siteName: string }) {
  const pathname = usePathname();

  return (
    <aside className="a-sidebar">
      <Link href="/admin" className="a-sidebar__brand">
        {/* Logo bisa hasil upload dengan rasio bebas, jadi pakai <img> dengan tinggi tetap dari CSS. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} alt={siteName} />
        <small>Panel Admin</small>
      </Link>
      <nav>
        {groups.map((g) => (
          <div key={g.title} className="a-sidebar__group">
            <p>{g.title}</p>
            {g.links.map((l) => (
              <Link key={l.href} href={l.href} className={pathname === l.href ? "active" : undefined}>
                {l.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div className="a-sidebar__foot">
        <a href="/" target="_blank" rel="noopener">
          Lihat situs ↗
        </a>
        <form action={logout}>
          <button type="submit">Keluar</button>
        </form>
      </div>
    </aside>
  );
}
