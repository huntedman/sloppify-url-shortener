import { describe, expect, it } from "vitest";

import type { ShortCodeGenerator } from "../ports/outbound/short-code-generator.js";
import { CreateShortLinkService } from "./create-short-link-service.js";

class FixedShortCodeGenerator implements ShortCodeGenerator {
  constructor(private readonly shortCode: string) {}

  generate(): string {
    return this.shortCode;
  }
}

describe("CreateShortLinkService", () => {
  it("returns a short-link result for a valid original URL", () => {
    const shortLinkService = new CreateShortLinkService({
      shortCodeGenerator: new FixedShortCodeGenerator("0000000"),
      baseDomain: "https://sloppify.com",
    });

    const originalUrl = "https://example.com/a/very/long/link";

    const newLink = shortLinkService.createShortLink({ url: originalUrl });

    expect(newLink.shortLink).toEqual("https://sloppify.com/0000000");
  });
});
