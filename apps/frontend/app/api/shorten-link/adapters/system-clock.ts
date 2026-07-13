import { Clock } from "@sloppify/domain-core";

export class SystemClock implements Clock {
  nowInMilliseconds(): number {
    return Date.now();
  }
}
