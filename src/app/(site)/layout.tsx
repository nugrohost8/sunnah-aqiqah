import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/settings";
import { fontVariables } from "../fonts";
import "./site.css";

// getSiteSettings() di-cache, jadi metadata tetap ikut prerender statis.
export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return {
    title: s.metaTitle,
    description: s.metaDescription,
    metadataBase: new URL(s.websiteUrl),
    // URL tetap; route /site-icon mengarah ke favicon yang sedang aktif.
    icons: { icon: "/site-icon", apple: "/site-icon" },
    openGraph: { siteName: s.siteName, title: s.metaTitle, description: s.metaDescription, locale: "id_ID", type: "website" },
  };
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
