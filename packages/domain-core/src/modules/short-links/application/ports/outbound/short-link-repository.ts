import { OriginalUrl } from "../../../domain/original-url.js";

export interface NewShortLink {
  readonly originalUrl: OriginalUrl;
  readonly shortCode: string;
}

export interface ShortLinkRepository {
  create(params: NewShortLink): Promise<void>;
}
