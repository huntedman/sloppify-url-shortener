import { describe, expect, it } from "vitest";
import { CreateShortLinkService } from "./create-short-link-service.js";

describe("CreateShortLinkService", () => {
  it("returns a short-link result", () => {
    const shortLinkService = new CreateShortLinkService();
    const originalUrl = "testing123";

    const newLink = shortLinkService.createShortLink({ url: originalUrl });

    expect(newLink.shortLink).toEqual(originalUrl);
  });
});
