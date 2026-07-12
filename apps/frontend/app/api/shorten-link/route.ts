import {
  shortenLinkApiErrors,
  shortenLinkRequestSchema,
  type ShortenLinkApiError,
} from "@sloppify/shared-contracts";
import {
  CreateShortLinkService,
  InvalidOriginalUrlError,
} from "@sloppify/domain-core";

export const runtime = "nodejs";

const createShortLinkService = new CreateShortLinkService();

function badRequest(error: ShortenLinkApiError): Response {
  return Response.json({ error }, { status: 400 });
}

function internalServerError(): Response {
  return Response.json(
    { error: shortenLinkApiErrors.internalServerError },
    { status: 500 },
  );
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return badRequest(shortenLinkApiErrors.invalidJson);
  }

  const parsedBody = shortenLinkRequestSchema.safeParse(body);

  if (!parsedBody.success) {
    return badRequest(shortenLinkApiErrors.invalidRequest);
  }

  try {
    const result = createShortLinkService.createShortLink({
      url: parsedBody.data.url,
    });

    return Response.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof InvalidOriginalUrlError) {
      return badRequest(shortenLinkApiErrors.invalidOriginalUrl);
    }

    console.error(
      "Encountered an unexpected error while shortening link:",
      error,
    );

    return internalServerError();
  }
}
