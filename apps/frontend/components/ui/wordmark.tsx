import { Link } from "./link";

export function Wordmark() {
  return (
    <Link aria-label="Sloppify home" href="/" variant="brand">
      Sloppify<span className="text-accent">.</span>
    </Link>
  );
}
