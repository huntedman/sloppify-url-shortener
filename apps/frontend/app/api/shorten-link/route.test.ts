import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { shortenLinkErrorResponseSchema } from "@sloppify/shared-contracts";
import { CreateShortLinkService } from "@sloppify/domain-core";

import { SystemClock } from "./adapters/system-clock.js";
import { SupabaseShortLinkRepository } from "./adapters/supabase-short-link-repository.js";
import { POST } from "./route.js";

vi.hoisted(() => {
  process.env.SHORT_LINK_BASE_URL = "https://sloppify.com";
  process.env.SUPABASE_URL = "http://127.0.0.1:54321";
  process.env.SUPABASE_SECRET_KEY = "test-secret-key";
});

describe("POST /api/shorten-link", () => {
  beforeEach(() => {
    vi.spyOn(
      SupabaseShortLinkRepository.prototype,
      "create",
    ).mockResolvedValue();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the short-link result", async () => {
    vi.spyOn(SystemClock.prototype, "nowInMilliseconds").mockReturnValue(
      1_783_900_800_000,
    );

    const url = "https://example.com/a/very/long/link";
    const request = new Request("http://localhost/api/shorten-link", {
      body: JSON.stringify({ url }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      shortLink: "https://sloppify.com/VPCrxUO",
    });
  });

  it("rejects an invalid payload shape", async () => {
    const request = new Request("http://localhost/api/shorten-link", {
      body: JSON.stringify({ url: 42 }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    const response = await POST(request);
    const body = shortenLinkErrorResponseSchema.parse(await response.json());

    expect(response.status).toBe(400);
    expect(body).toEqual({
      error: {
        code: "INVALID_REQUEST",
        message: "A valid URL is required.",
      },
    });
  });

  it("returns a safe error without exposing internal details", async () => {
    const internalError = new Error("database error: do-not-expose");
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    vi.spyOn(
      CreateShortLinkService.prototype,
      "createShortLink",
    ).mockImplementationOnce(() => {
      throw internalError;
    });

    const request = new Request("http://localhost/api/shorten-link", {
      body: JSON.stringify({ url: "https://example.com" }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    const response = await POST(request);
    const body = shortenLinkErrorResponseSchema.parse(await response.json());

    expect(response.status).toBe(500);
    expect(body).toEqual({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Unable to shorten this link.",
      },
    });
    expect(JSON.stringify(body)).not.toContain(internalError.message);
    expect(consoleError).toHaveBeenCalledWith(
      expect.any(String),
      internalError,
    );
  });
});
