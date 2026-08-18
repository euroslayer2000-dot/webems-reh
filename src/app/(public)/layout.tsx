import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { getSettings } from "@/lib/settings";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <>
      <Navbar siteName={settings.site_name || "EMS ROI-ET HOSPITAL"} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
    </>
  );
}
