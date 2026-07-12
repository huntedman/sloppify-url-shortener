import type { ShortLink } from "../../../domain/short-link.js";
import type { OriginalUrl } from "../../../domain/url.js";

export interface CreateShortLinkCommand {
  url: OriginalUrl;
}

export interface CreateShortLinkResult {
  shortLink: ShortLink;
}

export interface CreateShortLinkUseCase {
  createShortLink(command: CreateShortLinkCommand): CreateShortLinkResult;
}
