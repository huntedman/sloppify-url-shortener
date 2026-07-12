import { describe, expect, it } from "vitest";

import { InvalidOriginalUrlError, OriginalUrl } from "./original-url.js";

describe("OriginalUrl", () => {
  it.each([
    ["http://example.com", "http:"],
    ["https://example.com/path?query=value#fragment", "https:"],
  ] as const)("accepts %s", (value, protocol) => {
    const originalUrl = OriginalUrl.create(`  ${value}  `);

    expect(originalUrl.value).toBe(value);
    expect(originalUrl.protocol).toBe(protocol);
  });

  it.each([
    "",
    "not-a-url",
    "/relative-path",
    "ftp://example.com",
    "mailto:hello@example.com",
  ])("rejects %j", (value) => {
    expect(() => OriginalUrl.create(value)).toThrow(InvalidOriginalUrlError);
  });
});
