import { afterEach, describe, expect, it, vi } from "vitest";
import { shortenLinkErrorResponseSchema } from "@sloppify/shared-contracts";
import { CreateShortLinkService } from "@sloppify/domain-core";

import { POST } from "./route.js";

describe("POST /api/shorten-link", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the short-link result", async () => {
    const url = "https://example.com/a/very/long/link";
    const request = new Request("http://localhost/api/shorten-link", {
      body: JSON.stringify({ url }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ shortLink: url });
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

  it("returns a specified error for an unsupported URL protocol", async () => {
    const request = new Request("http://localhost/api/shorten-link", {
      body: JSON.stringify({ url: "ftp://example.com/file" }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    const response = await POST(request);
    const body = shortenLinkErrorResponseSchema.parse(await response.json());

    expect(response.status).toBe(400);
    expect(body).toEqual({
      error: {
        code: "INVALID_ORIGINAL_URL",
        message: "Enter a valid HTTP or HTTPS URL.",
      },
    });
  });

  it("returns a specified error for malformed JSON", async () => {
    const request = new Request("http://localhost/api/shorten-link", {
      body: "{",
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    const response = await POST(request);
    const body = shortenLinkErrorResponseSchema.parse(await response.json());

    expect(response.status).toBe(400);
    expect(body).toEqual({
      error: {
        code: "INVALID_JSON",
        message: "Request body must be valid JSON.",
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
