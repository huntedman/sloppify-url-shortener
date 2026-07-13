import { ResolveShortLinkService } from "@sloppify/domain-core";
import { createAdminClient } from "@supabase/server/core";

import type { Database } from "../api/database.types";
import { SupabaseShortLinkRepository } from "../api/shorten-link/adapters/supabase-short-link-repository";

export const runtime = "nodejs";

const client = createAdminClient<Database>();
const shortLinkRepository = new SupabaseShortLinkRepository({ client });
const resolveShortLinkService = new ResolveShortLinkService({
  shortLinkRepository,
});

function notFound(): Response {
  return new Response(null, { status: 404 });
}

function internalServerError(): Response {
  return new Response(null, { status: 500 });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ shortCode: string }> },
): Promise<Response> {
  const { shortCode } = await params;

  try {
    const result = await resolveShortLinkService.resolveShortLink({
      shortCode,
    });

    if (!result.found) {
      return notFound();
    }

    return Response.redirect(result.originalUrl, 301);
  } catch (error) {
    console.error(
      "Encountered an unexpected error while resolving link:",
      error,
    );

    return internalServerError();
  }
}
