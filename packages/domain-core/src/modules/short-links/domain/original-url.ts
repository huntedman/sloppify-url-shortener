import { URL } from "node:url";

const INVALID_ORIGINAL_URL_MESSAGE =
  "Original URL must be a valid HTTP or HTTPS URL.";

export class InvalidOriginalUrlError extends Error {
  constructor() {
    super(INVALID_ORIGINAL_URL_MESSAGE);
    this.name = "InvalidOriginalUrlError";
  }
}

export class OriginalUrl {
  readonly #url: URL;
  readonly #value: string;

  private constructor(value: string, url: URL) {
    this.#value = value;
    this.#url = url;
  }

  static create(value: string): OriginalUrl {
    const trimmedValue = value.trim();
    let url: URL;

    try {
      url = new URL(trimmedValue);
    } catch {
      throw new InvalidOriginalUrlError();
    }

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new InvalidOriginalUrlError();
    }

    return new OriginalUrl(trimmedValue, url);
  }

  get value(): string {
    return this.#value;
  }

  get protocol(): "http:" | "https:" {
    return this.#url.protocol as "http:" | "https:";
  }

  toString(): string {
    return this.value;
  }
}
