import type { Clock } from "../ports/outbound/clock.js";
import type { ShortCodeGenerator } from "../ports/outbound/short-code-generator.js";

// Our custom ASCII Sortable alphabet
const BASE62_ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

// Number of symbols available for each position in our shortcode
const BASE = BigInt(BASE62_ALPHABET.length);
const SHORT_CODE_LENGTH = 7;

// Calculate the largest integer that can fit into our 7 character Base62 Code
const MAX_SHORT_CODE_VALUE = BASE ** BigInt(SHORT_CODE_LENGTH) - 1n;

export class UnixTimestampShortCodeGenerator implements ShortCodeGenerator {
  constructor(private readonly clock: Clock) {}

  generate(): string {
    const timestamp = this.clock.nowInMilliseconds();

    // A clock implementation can provide non-safe integer values
    // We want to safeguard against it
    if (!Number.isSafeInteger(timestamp) || timestamp < 0) {
      throw new RangeError(
        "Unix timestamp must be a non-negative safe integer.",
      );
    }

    let remaining = BigInt(timestamp);

    // A custom clock implementation can also provide values that are way out in to the future
    // or the future might become the present one day. We want to guard against this also.
    if (remaining > MAX_SHORT_CODE_VALUE) {
      throw new RangeError(
        "Unix timestamp exceeds the seven-character Base62 capacity.",
      );
    }

    let shortCode = "";

    // Convert from Base10 into Base62
    do {
      const characterIndex = Number(remaining % BASE);
      shortCode = BASE62_ALPHABET.charAt(characterIndex) + shortCode;
      remaining /= BASE;
    } while (remaining > 0n);

    // Add our alphabet's zero character to the left until result is seven characters, e.g 101 → 0000101
    return shortCode.padStart(SHORT_CODE_LENGTH, BASE62_ALPHABET.charAt(0));
  }
}
