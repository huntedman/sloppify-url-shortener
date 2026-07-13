import {
  shortenLinkApiErrors,
  shortenLinkRequestSchema,
  type ShortenLinkApiError,
} from "@sloppify/shared-contracts";
import {
  CreateShortLinkService,
  InvalidOriginalUrlError,
  UnixTimestampShortCodeGenerator,
} from "@sloppify/domain-core";
import { SystemClock } from "./adapters/system-clock";

export const runtime = "nodejs";

const baseDomain = process.env.SHORT_LINK_BASE_URL;

if (!baseDomain) {
  throw new Error("SHORT_LINK_BASE_URL is not configured.");
}

const systemClock = new SystemClock();
const shortCodeGenerator = new UnixTimestampShortCodeGenerator(systemClock);
const createShortLinkService = new CreateShortLinkService({
  shortCodeGenerator,
  baseDomain,
});

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
