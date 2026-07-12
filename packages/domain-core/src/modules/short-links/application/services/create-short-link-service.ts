import type {
  CreateShortLinkCommand,
  CreateShortLinkResult,
  CreateShortLinkUseCase,
} from "../ports/inbound/create-short-link-use-case.js";
import { OriginalUrl } from "../../domain/original-url.js";

export class CreateShortLinkService implements CreateShortLinkUseCase {
  createShortLink(command: CreateShortLinkCommand): CreateShortLinkResult {
    const originalUrl = OriginalUrl.create(command.url);

    return { shortLink: originalUrl.value };
  }
}
