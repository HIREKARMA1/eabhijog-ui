/** Normalize OSD route slugs (e.g. "commerce transport" → "commerce-transport"). */
export function normalizeOsdSlug(slug: string): string {
  return decodeURIComponent(slug)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/&/g, "")
    .replace(/--+/g, "-");
}
