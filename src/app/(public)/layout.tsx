import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { getSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";
import { PopupBannerModal } from "@/components/public/popup-banner-modal";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [settings, popupBanners] = await Promise.all([
    getSettings(),
    prisma.banner.findMany({
      where: { position: "popup", is_active: true },
      orderBy: [{ sort_order: "asc" }, { id: "asc" }],
      take: 3,
      select: { id: true, title: true, image: true, link_url: true },
    }),
  ]);

  return (
    <>
      <Navbar siteName={settings.site_name || "EMS ROI-ET HOSPITAL"} />
      <main className="flex-1 bg-surface">{children}</main>
      <Footer settings={settings} />
      <PopupBannerModal banners={popupBanners} />
    </>
  );
}
