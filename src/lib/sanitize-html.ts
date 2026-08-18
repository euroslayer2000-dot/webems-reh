import sanitizeHtml from "sanitize-html";

/** Sanitizes CKEditor-authored HTML before it's persisted. Same intent as the
 * Laravel app's regex-based sanitizeContent() (strip script/style/iframe/
 * object/embed, on* handlers, javascript: URLs) but using a real HTML parser
 * (an allowlist) instead of regex, which is both safer and covers more of
 * CKEditor's actual output (tables, images, headings, etc). */
export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "strong", "b", "em", "i", "u", "s", "span", "div",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li", "blockquote", "pre", "code",
      "a", "img", "figure", "figcaption",
      "table", "thead", "tbody", "tr", "td", "th",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height"],
      "*": ["class"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowProtocolRelative: false,
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }, true),
    },
  }).trim();
}
