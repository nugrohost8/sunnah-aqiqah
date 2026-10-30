import { Sidebar } from "@/components/admin/Sidebar";
import { getSiteSettings } from "@/lib/settings";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  // Di-cache ("use cache"), jadi tetap masuk shell statis dan tidak memperlambat navigasi.
  const { logoLight, siteName } = await getSiteSettings();
  return (
    <div className="a-shell">
      <Sidebar logo={logoLight} siteName={siteName} />
      <main className="a-main">{children}</main>
    </div>
  );
}
