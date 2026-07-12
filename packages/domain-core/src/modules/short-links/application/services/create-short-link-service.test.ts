import { describe, expect, it } from "vitest";
import { CreateShortLinkService } from "./create-short-link-service.js";

describe("CreateShortLinkService", () => {
  it("returns a short-link result for a valid original URL", () => {
    const shortLinkService = new CreateShortLinkService();
    const originalUrl = "https://example.com/a/very/long/link";

    const newLink = shortLinkService.createShortLink({ url: originalUrl });

    expect(newLink.shortLink).toEqual(originalUrl);
  });
});
