import type { NewShortLink, ShortLinkRepository } from "@sloppify/domain-core";
import type { SupabaseClient } from "@supabase/server/peer/supabase-js";

import type { Database } from "../../database.types";

interface SupabaseShortLinkRepositoryProps {
  client: SupabaseClient<Database>;
}

export class SupabaseShortLinkRepository implements ShortLinkRepository {
  private _client: SupabaseClient<Database>;

  constructor(props: SupabaseShortLinkRepositoryProps) {
    this._client = props.client;
  }

  async create(shortLink: NewShortLink): Promise<void> {
    const { error } = await this._client.from("short_links").insert({
      original_url: shortLink.originalUrl.value,
      short_code: shortLink.shortCode,
    });

    if (error) {
      throw new Error("Failed to persist short link.", {
        cause: error,
      });
    }
  }
}
