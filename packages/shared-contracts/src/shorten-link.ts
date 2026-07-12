import { z } from "zod";

export const shortenLinkRequestSchema = z.object({
  url: z.url().trim().min(1),
});

export const shortenLinkApiErrorCodeSchema = z.enum([
  "INVALID_JSON",
  "INVALID_REQUEST",
  "INVALID_ORIGINAL_URL",
  "INTERNAL_SERVER_ERROR",
]);

export const shortenLinkApiErrorSchema = z.object({
  code: shortenLinkApiErrorCodeSchema,
  message: z.string(),
});

export const shortenLinkErrorResponseSchema = z.object({
  error: shortenLinkApiErrorSchema,
});

export const shortenLinkSuccessResponseSchema = z.object({
  shortLink: z.url(),
});

export type ShortenLinkRequest = z.infer<typeof shortenLinkRequestSchema>;
export type ShortenLinkApiError = z.infer<typeof shortenLinkApiErrorSchema>;
export type ShortenLinkErrorResponse = z.infer<
  typeof shortenLinkErrorResponseSchema
>;
export type ShortenLinkSuccessResponse = z.infer<
  typeof shortenLinkSuccessResponseSchema
>;

export const shortenLinkApiErrors = {
  invalidJson: {
    code: "INVALID_JSON",
    message: "Request body must be valid JSON.",
  },
  invalidRequest: {
    code: "INVALID_REQUEST",
    message: "A valid URL is required.",
  },
  invalidOriginalUrl: {
    code: "INVALID_ORIGINAL_URL",
    message: "Enter a valid HTTP or HTTPS URL.",
  },
  internalServerError: {
    code: "INTERNAL_SERVER_ERROR",
    message: "Unable to shorten this link.",
  },
} as const satisfies Record<string, ShortenLinkApiError>;
