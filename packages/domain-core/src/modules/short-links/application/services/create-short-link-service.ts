import { OriginalUrl } from "../../domain/original-url.js";
import type {
  CreateShortLinkCommand,
  CreateShortLinkResult,
  CreateShortLinkUseCase,
} from "../ports/inbound/create-short-link-use-case.js";

import type { ShortCodeGenerator } from "../ports/outbound/short-code-generator.js";
import { ShortLinkRepository } from "../ports/outbound/short-link-repository.js";

export interface CreateShortLinkServiceProps {
  shortCodeGenerator: ShortCodeGenerator;
  shortLinkRepository: ShortLinkRepository;
  baseDomain: string;
}

export class CreateShortLinkService implements CreateShortLinkUseCase {
  private _shortCodeGenerator: ShortCodeGenerator;
  private _baseDomain: string;
  private _shortLinkRepository: ShortLinkRepository;

  constructor(props: CreateShortLinkServiceProps) {
    this._shortCodeGenerator = props.shortCodeGenerator;
    this._baseDomain = props.baseDomain;
    this._shortLinkRepository = props.shortLinkRepository;
  }

  async createShortLink(
    command: CreateShortLinkCommand,
  ): Promise<CreateShortLinkResult> {
    const originalUrl = OriginalUrl.create(command.url);
    const shortCode = this._shortCodeGenerator.generate();

    await this._shortLinkRepository.create({
      originalUrl,
      shortCode,
    });

    return { shortLink: `${this._baseDomain.toString()}/${shortCode}` };
  }
}
