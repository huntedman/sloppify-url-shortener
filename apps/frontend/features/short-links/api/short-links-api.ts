"use client";

import {
  shortenLinkErrorResponseSchema,
  shortenLinkSuccessResponseSchema,
  type ShortenLinkApiError,
  type ShortenLinkRequest,
  type ShortenLinkSuccessResponse,
} from "@sloppify/shared-contracts";

const SHORTEN_LINK_ENDPOINT = "/api/shorten-link";
const UNEXPECTED_RESPONSE_MESSAGE = "Unable to shorten this link.";

export class ShortLinksApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: ShortenLinkApiError["code"],
  ) {
    super(message);
    this.name = "ShortLinksApiError";
  }
}

export class ShortLinksApi {
  async create(
    payload: ShortenLinkRequest,
  ): Promise<ShortenLinkSuccessResponse> {
    const response = await fetch(SHORTEN_LINK_ENDPOINT, {
      body: JSON.stringify(payload),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    let responseBody: unknown;

    try {
      responseBody = await response.json();
    } catch {
      throw new ShortLinksApiError(
        UNEXPECTED_RESPONSE_MESSAGE,
        response.status,
      );
    }

    if (!response.ok) {
      const errorResponse =
        shortenLinkErrorResponseSchema.safeParse(responseBody);

      if (errorResponse.success) {
        throw new ShortLinksApiError(
          errorResponse.data.error.message,
          response.status,
          errorResponse.data.error.code,
        );
      }

      throw new ShortLinksApiError(
        UNEXPECTED_RESPONSE_MESSAGE,
        response.status,
      );
    }

    const successResponse =
      shortenLinkSuccessResponseSchema.safeParse(responseBody);

    if (!successResponse.success) {
      throw new ShortLinksApiError(
        UNEXPECTED_RESPONSE_MESSAGE,
        response.status,
      );
    }

    return successResponse.data;
  }
}

export const shortLinksApi = new ShortLinksApi();
