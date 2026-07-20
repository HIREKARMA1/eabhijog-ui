import { OsdLayout } from "@/components/layout/OsdLayout";
import { normalizeOsdSlug } from "@/lib/navigation/osd-slug";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

/** Persist OSD shell across navigations so only the content area reloads. */
export default async function OsdSlugLayout({ children, params }: LayoutProps) {
  const { slug: rawSlug } = await params;
  const slug = normalizeOsdSlug(rawSlug);
  return <OsdLayout osdSlug={slug}>{children}</OsdLayout>;
}
