import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/server/peer/supabase-js";

import type { Database } from "../../database.types";
import { SupabaseShortLinkRepository } from "./supabase-short-link-repository.js";

interface LookupResult {
  data: { original_url: string } | null;
  error: unknown;
}

function createClientStub(result: LookupResult) {
  const maybeSingle = vi.fn().mockResolvedValue(result);
  const eq = vi.fn().mockReturnValue({ maybeSingle });
  const select = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ select });

  return {
    client: { from } as unknown as SupabaseClient<Database>,
    eq,
    from,
    maybeSingle,
    select,
  };
}

describe("SupabaseShortLinkRepository.findOriginalUrlByShortCode", () => {
  it("returns the original URL for a stored short code", async () => {
    const originalUrl = "https://example.com/a/very/long/link?from=shortener";
    const clientStub = createClientStub({
      data: { original_url: originalUrl },
      error: null,
    });
    const repository = new SupabaseShortLinkRepository({
      client: clientStub.client,
    });

    const result = await repository.findOriginalUrlByShortCode("AbC1234");

    expect(result?.value).toBe(originalUrl);
    expect(clientStub.from).toHaveBeenCalledWith("short_links");
    expect(clientStub.select).toHaveBeenCalledWith("original_url");
    expect(clientStub.eq).toHaveBeenCalledWith("short_code", "AbC1234");
    expect(clientStub.maybeSingle).toHaveBeenCalledOnce();
  });

  it("returns null when the short code is not stored", async () => {
    const clientStub = createClientStub({ data: null, error: null });
    const repository = new SupabaseShortLinkRepository({
      client: clientStub.client,
    });

    await expect(
      repository.findOriginalUrlByShortCode("Missing"),
    ).resolves.toBeNull();
  });

  it("wraps database lookup failures without leaking their details", async () => {
    const databaseError = new Error("sensitive database details");
    const clientStub = createClientStub({ data: null, error: databaseError });
    const repository = new SupabaseShortLinkRepository({
      client: clientStub.client,
    });

    const error = await repository
      .findOriginalUrlByShortCode("AbC1234")
      .catch((caughtError: unknown) => caughtError);

    expect(error).toBeInstanceOf(Error);
    expect(error).toMatchObject({
      cause: databaseError,
      message: "Failed to retrieve short link.",
    });
  });
});
