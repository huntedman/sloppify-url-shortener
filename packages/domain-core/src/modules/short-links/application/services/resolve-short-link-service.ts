import type {
  ResolveShortLinkCommand,
  ResolveShortLinkResult,
  ResolveShortLinkUseCase,
} from "../ports/inbound/resolve-short-link-use-case.js";
import type { ShortLinkRepository } from "../ports/outbound/short-link-repository.js";

const SHORT_CODE_PATTERN = /^[0-9A-Za-z]{7}$/;

export interface ResolveShortLinkServiceProps {
  shortLinkRepository: ShortLinkRepository;
}

export class ResolveShortLinkService implements ResolveShortLinkUseCase {
  private _shortLinkRepository: ShortLinkRepository;

  constructor(props: ResolveShortLinkServiceProps) {
    this._shortLinkRepository = props.shortLinkRepository;
  }

  async resolveShortLink(
    command: ResolveShortLinkCommand,
  ): Promise<ResolveShortLinkResult> {
    if (!SHORT_CODE_PATTERN.test(command.shortCode)) {
      return { found: false };
    }

    const originalUrl =
      await this._shortLinkRepository.findOriginalUrlByShortCode(
        command.shortCode,
      );

    if (!originalUrl) {
      return { found: false };
    }

    return { found: true, originalUrl: originalUrl.value };
  }
}
