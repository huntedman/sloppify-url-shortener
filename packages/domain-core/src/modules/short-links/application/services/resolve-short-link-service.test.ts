import { describe, expect, it } from "vitest";

import { OriginalUrl } from "../../domain/original-url.js";
import type { ShortLinkRepository } from "../ports/outbound/short-link-repository.js";
import { ResolveShortLinkService } from "./resolve-short-link-service.js";

class StubShortLinkRepository implements ShortLinkRepository {
  readonly queriedShortCodes: string[] = [];

  constructor(private readonly originalUrl: OriginalUrl | null) {}

  create(): Promise<void> {
    return Promise.resolve();
  }

  findOriginalUrlByShortCode(shortCode: string): Promise<OriginalUrl | null> {
    this.queriedShortCodes.push(shortCode);
    return Promise.resolve(this.originalUrl);
  }
}

describe("ResolveShortLinkService", () => {
  it("resolves a short code to its original URL", async () => {
    const originalUrl = OriginalUrl.create(
      "https://example.com/a/very/long/link?from=shortener",
    );
    const shortLinkRepository = new StubShortLinkRepository(originalUrl);
    const resolveShortLinkService = new ResolveShortLinkService({
      shortLinkRepository,
    });

    await expect(
      resolveShortLinkService.resolveShortLink({ shortCode: "AbC1234" }),
    ).resolves.toEqual({ found: true, originalUrl: originalUrl.value });
    expect(shortLinkRepository.queriedShortCodes).toEqual(["AbC1234"]);
  });

  it("returns a not-found result for a missing short code", async () => {
    const shortLinkRepository = new StubShortLinkRepository(null);
    const resolveShortLinkService = new ResolveShortLinkService({
      shortLinkRepository,
    });

    await expect(
      resolveShortLinkService.resolveShortLink({ shortCode: "Missing" }),
    ).resolves.toEqual({ found: false });
    expect(shortLinkRepository.queriedShortCodes).toEqual(["Missing"]);
  });

  it("returns a not-found result for malformed codes without querying the repository", async () => {
    const shortLinkRepository = new StubShortLinkRepository(null);
    const resolveShortLinkService = new ResolveShortLinkService({
      shortLinkRepository,
    });

    await expect(
      resolveShortLinkService.resolveShortLink({ shortCode: "not-valid" }),
    ).resolves.toEqual({ found: false });
    expect(shortLinkRepository.queriedShortCodes).toEqual([]);
  });
});
