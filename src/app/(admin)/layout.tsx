import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/settings";
import { fontVariables } from "../fonts";
import "./admin.css";

export async function generateMetadata(): Promise<Metadata> {
  const { siteName } = await getSiteSettings();
  return {
    title: { default: "Admin", template: `%s · Admin ${siteName}` },
    robots: { index: false, follow: false },
    icons: { icon: "/site-icon" },
  };
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
