/** Allowlisted HTML sanitizer for hearing event-page rich text. */

const ALLOWED_TAGS = new Set([
  "P",
  "BR",
  "STRONG",
  "B",
  "EM",
  "I",
  "U",
  "UL",
  "OL",
  "LI",
  "A",
  "DIV",
  "SPAN",
]);

function isSafeHref(href: string) {
  const value = href.trim().toLowerCase();
  return (
    value.startsWith("https://") ||
    value.startsWith("http://") ||
    value.startsWith("mailto:") ||
    value.startsWith("/") ||
    value.startsWith("#")
  );
}

/** Sanitize rich-text HTML for safe public rendering. */
export function sanitizeHearingHtml(input: string): string {
  if (typeof window === "undefined") {
    return stripUnsafeServerSide(input);
  }
  const template = document.createElement("template");
  template.innerHTML = input;
  walk(template.content);
  return template.innerHTML;
}

function walk(root: ParentNode) {
  const nodes = Array.from(root.childNodes);
  for (const node of nodes) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (!ALLOWED_TAGS.has(el.tagName)) {
        const parent = el.parentNode;
        if (!parent) continue;
        while (el.firstChild) parent.insertBefore(el.firstChild, el);
        parent.removeChild(el);
        continue;
      }
      for (const attr of Array.from(el.attributes)) {
        const name = attr.name.toLowerCase();
        if (el.tagName === "A" && name === "href" && isSafeHref(attr.value)) {
          el.setAttribute("rel", "noopener noreferrer");
          el.setAttribute("target", "_blank");
          continue;
        }
        el.removeAttribute(attr.name);
      }
      walk(el);
    } else if (node.nodeType === Node.COMMENT_NODE) {
      node.parentNode?.removeChild(node);
    }
  }
}

function stripUnsafeServerSide(input: string): string {
  return input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/on\w+=["'][^"']*["']/gi, "")
    .replace(/javascript:/gi, "");
}

export function looksLikeHtml(value: string | null | undefined) {
  return /<\/?[a-z][\s\S]*>/i.test(value || "");
}

/** Plain-text preview for list cards. */
export function plainTextFromHearingHtml(value: string | null | undefined) {
  const raw = (value || "").trim();
  if (!raw) return "";
  if (!looksLikeHtml(raw)) return raw;
  return raw
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function isEmptyHearingHtml(value: string | null | undefined) {
  const plain = plainTextFromHearingHtml(value);
  return !plain;
}

/** Convert newline bullet defaults into simple HTML lists for the editor. */
export function linesToHtmlList(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
  if (lines.length === 0) return "<p></p>";
  return `<ul>${lines.map((line) => `<li>${escapeText(line)}</li>`).join("")}</ul>`;
}

function escapeText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function toEditorHtml(value: string | null | undefined, fallbackPlain = "") {
  const raw = (value || "").trim();
  if (!raw) {
    return fallbackPlain ? linesToHtmlList(fallbackPlain) : "<p></p>";
  }
  if (looksLikeHtml(raw)) return raw;
  return linesToHtmlList(raw);
}
