import type { ShortLink } from "../../../domain/short-link.js";

export interface CreateShortLinkCommand {
  url: string;
}

export interface CreateShortLinkResult {
  shortLink: ShortLink;
}

export interface CreateShortLinkUseCase {
  createShortLink(command: CreateShortLinkCommand): CreateShortLinkResult;
}
