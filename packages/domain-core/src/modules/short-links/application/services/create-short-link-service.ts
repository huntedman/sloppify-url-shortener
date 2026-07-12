import type {
  CreateShortLinkCommand,
  CreateShortLinkResult,
  CreateShortLinkUseCase,
} from "../ports/inbound/create-short-link-use-case.js";

export class CreateShortLinkService implements CreateShortLinkUseCase {
  createShortLink(command: CreateShortLinkCommand): CreateShortLinkResult {
    return { shortLink: command.url };
  }
}
