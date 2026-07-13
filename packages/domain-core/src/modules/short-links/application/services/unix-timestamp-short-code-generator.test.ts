import { describe, expect, it } from "vitest";

import type { Clock } from "../ports/outbound/clock.js";
import { UnixTimestampShortCodeGenerator } from "./unix-timestamp-short-code-generator.js";

// A specific instance of our clock that we're only using in this test case
class FixedClock implements Clock {
  constructor(private readonly timestamp: number) {}

  nowInMilliseconds(): number {
    return this.timestamp;
  }
}

describe("UnixTimestampShortCodeGenerator", () => {
  // Using our custom clock provider, we can iterate through the different shortcode values
  // and ensure the code generator generates expected values
  it.each([
    [0, "0000000"],
    [61, "000000z"],
    [62, "0000010"],
    [1_783_900_800_000, "VPCrxUO"],
    [3_521_614_606_207, "zzzzzzz"],
  ])("encodes Unix timestamp %i as %s", (timestamp, expected) => {
    const generator = new UnixTimestampShortCodeGenerator(
      new FixedClock(timestamp),
    );

    expect(generator.generate()).toBe(expected);
  });

  it.each([-1, 1.5, Number.NaN, 3_521_614_606_208])(
    "rejects timestamp %s outside the supported range",
    (timestamp) => {
      const generator = new UnixTimestampShortCodeGenerator(
        new FixedClock(timestamp),
      );

      expect(() => generator.generate()).toThrow(RangeError);
    },
  );
});
