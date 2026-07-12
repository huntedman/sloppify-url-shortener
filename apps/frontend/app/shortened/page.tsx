import { redirect } from "next/navigation";

import { CopyButton } from "@/components/ui/copy-button";
import { Link } from "@/components/ui/link";
import { Wordmark } from "@/components/ui/wordmark";

interface ShortenedPageProps {
  searchParams: Promise<{
    shortLink?: string | string[];
  }>;
}

function parseShortLink(value: string | string[] | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  try {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url.href;
  } catch {
    return null;
  }
}

export default async function ShortenedPage({
  searchParams,
}: ShortenedPageProps) {
  const { shortLink: requestedShortLink } = await searchParams;
  const shortLink = parseShortLink(requestedShortLink);

  if (!shortLink) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16 sm:px-8">
      <section
        aria-labelledby="shortened-heading"
        className="w-full max-w-2xl text-center"
      >
        <Wordmark />

        <h1
          className="mt-8 text-3xl font-medium tracking-tight sm:text-4xl"
          id="shortened-heading"
        >
          Your link is now ready to use.
        </h1>

        <div className="mt-10 flex items-center gap-3 rounded-2xl border border-border bg-surface p-2 pl-5 text-left">
          <Link
            className="min-w-0 flex-1 truncate sm:text-base"
            href={shortLink}
            rel="noreferrer"
            target="_blank"
          >
            {shortLink}
          </Link>
          <CopyButton value={shortLink} />
        </div>

        <Link className="mt-6 inline-block" href="/">
          Click here to shorten another link
        </Link>
      </section>
    </main>
  );
}
