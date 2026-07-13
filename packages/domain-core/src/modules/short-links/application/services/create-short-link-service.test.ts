import { describe, expect, it } from "vitest";

import type {
  NewShortLink,
  ShortLinkRepository,
} from "../ports/outbound/short-link-repository.js";
import type { ShortCodeGenerator } from "../ports/outbound/short-code-generator.js";
import { CreateShortLinkService } from "./create-short-link-service.js";

class FixedShortCodeGenerator implements ShortCodeGenerator {
  constructor(private readonly shortCode: string) {}

  generate(): string {
    return this.shortCode;
  }
}

class RecordingShortLinkRepository implements ShortLinkRepository {
  readonly shortLinks: NewShortLink[] = [];

  async create(shortLink: NewShortLink): Promise<void> {
    this.shortLinks.push(shortLink);
  }
}

describe("CreateShortLinkService", () => {
  it("persists and returns a short-link result for a valid original URL", async () => {
    const shortLinkRepository = new RecordingShortLinkRepository();
    const shortLinkService = new CreateShortLinkService({
      shortCodeGenerator: new FixedShortCodeGenerator("0000000"),
      shortLinkRepository,
      baseDomain: "https://sloppify.com",
    });

    const originalUrl = "https://example.com/a/very/long/link";

    const newLink = await shortLinkService.createShortLink({
      url: originalUrl,
    });

    expect(newLink.shortLink).toEqual("https://sloppify.com/0000000");
    expect(shortLinkRepository.shortLinks).toHaveLength(1);
    expect(shortLinkRepository.shortLinks[0]?.originalUrl.value).toBe(
      originalUrl,
    );
    expect(shortLinkRepository.shortLinks[0]?.shortCode).toBe("0000000");
  });
});
