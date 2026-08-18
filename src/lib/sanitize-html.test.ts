import { describe, expect, it } from "vitest";
import { sanitizeRichText } from "./sanitize-html";

describe("sanitizeRichText()", () => {
  it("strips script tags entirely, including their content", () => {
    const out = sanitizeRichText("<p>hello</p><script>alert(document.cookie)</script>");
    expect(out).not.toContain("script");
    expect(out).not.toContain("alert");
    expect(out).toContain("<p>hello</p>");
  });

  it("strips event handler attributes but keeps the element", () => {
    const out = sanitizeRichText('<img src="x.jpg" onerror="alert(1)">');
    expect(out).not.toContain("onerror");
    expect(out).toContain("<img");
  });

  it("neutralizes javascript: URLs in links", () => {
    const out = sanitizeRichText('<a href="javascript:alert(1)">click</a>');
    expect(out).not.toContain("javascript:");
  });

  it("removes iframe/object/embed tags", () => {
    const out = sanitizeRichText('<iframe src="https://evil.example"></iframe><object data="x"></object>');
    expect(out).not.toContain("iframe");
    expect(out).not.toContain("object");
  });

  it("preserves ordinary CKEditor-style formatting", () => {
    const html = "<h2>Title</h2><p>Some <strong>bold</strong> and <em>italic</em> text.</p><ul><li>one</li></ul>";
    expect(sanitizeRichText(html)).toBe(html);
  });

  it("keeps safe http(s) links with rel=noopener noreferrer added", () => {
    const out = sanitizeRichText('<a href="https://example.com">link</a>');
    expect(out).toContain('href="https://example.com"');
    expect(out).toContain("noopener");
  });
});
