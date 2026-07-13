import type {
  CreateShortLinkCommand,
  CreateShortLinkResult,
  CreateShortLinkUseCase,
} from "../ports/inbound/create-short-link-use-case.js";

import type { ShortCodeGenerator } from "../ports/outbound/short-code-generator.js";

export interface CreateShortLinkServiceProps {
  shortCodeGenerator: ShortCodeGenerator;
  baseDomain: string;
}

export class CreateShortLinkService implements CreateShortLinkUseCase {
  private _shortCodeGenerator: ShortCodeGenerator;
  private _baseDomain: string;

  constructor(props: CreateShortLinkServiceProps) {
    this._shortCodeGenerator = props.shortCodeGenerator;
    this._baseDomain = props.baseDomain;
  }

  // Override ESLint until next commit
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createShortLink(command: CreateShortLinkCommand): CreateShortLinkResult {
    const shortCode = this._shortCodeGenerator.generate();
    const shortURL = `${this._baseDomain.toString()}/${shortCode}`;

    return { shortLink: shortURL };
  }
}
