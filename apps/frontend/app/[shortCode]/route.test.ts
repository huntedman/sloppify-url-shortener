import { afterEach, describe, expect, it, vi } from "vitest";
import { OriginalUrl } from "@sloppify/domain-core";

import { SupabaseShortLinkRepository } from "../api/shorten-link/adapters/supabase-short-link-repository.js";
import { GET } from "./route.js";

vi.hoisted(() => {
  process.env.SUPABASE_URL = "http://127.0.0.1:54321";
  process.env.SUPABASE_SECRET_KEY = "test-secret-key";
});

function createRequest(shortCode: string): Request {
  return new Request(`http://localhost/${shortCode}`);
}

function createContext(shortCode: string) {
  return { params: Promise.resolve({ shortCode }) };
}

describe("GET /[shortCode]", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("redirects a stored short code to its original URL", async () => {
    const originalUrl = OriginalUrl.create(
      "https://example.com/a/very/long/link?from=shortener",
    );
    const findOriginalUrlByShortCode = vi
      .spyOn(
        SupabaseShortLinkRepository.prototype,
        "findOriginalUrlByShortCode",
      )
      .mockResolvedValue(originalUrl);

    const response = await GET(
      createRequest("AbC1234"),
      createContext("AbC1234"),
    );

    expect(response.status).toBe(301);
    expect(response.headers.get("location")).toBe(originalUrl.value);
    expect(findOriginalUrlByShortCode).toHaveBeenCalledExactlyOnceWith(
      "AbC1234",
    );
  });

  it("returns not found for an unknown short code", async () => {
    vi.spyOn(
      SupabaseShortLinkRepository.prototype,
      "findOriginalUrlByShortCode",
    ).mockResolvedValue(null);

    const response = await GET(
      createRequest("Missing"),
      createContext("Missing"),
    );

    expect(response.status).toBe(404);
    expect(response.headers.get("location")).toBeNull();
  });

  it("returns not found for malformed short codes without querying storage", async () => {
    const findOriginalUrlByShortCode = vi
      .spyOn(
        SupabaseShortLinkRepository.prototype,
        "findOriginalUrlByShortCode",
      )
      .mockResolvedValue(null);

    const response = await GET(
      createRequest("not-valid"),
      createContext("not-valid"),
    );

    expect(response.status).toBe(404);
    expect(findOriginalUrlByShortCode).not.toHaveBeenCalled();
  });

  it("returns a safe error when storage lookup fails", async () => {
    const internalError = new Error("database error: do-not-expose");
    vi.spyOn(
      SupabaseShortLinkRepository.prototype,
      "findOriginalUrlByShortCode",
    ).mockRejectedValue(internalError);
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const response = await GET(
      createRequest("AbC1234"),
      createContext("AbC1234"),
    );

    expect(response.status).toBe(500);
    await expect(response.text()).resolves.not.toContain(internalError.message);
    expect(consoleError).toHaveBeenCalledWith(
      "Encountered an unexpected error while resolving link:",
      internalError,
    );
  });
});
