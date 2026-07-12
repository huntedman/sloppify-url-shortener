"use client";

import { shortenLinkRequestSchema } from "@sloppify/shared-contracts";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SubmitEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wordmark } from "@/components/ui/wordmark";
import {
  shortLinksApi,
  ShortLinksApiError,
} from "@/features/short-links/api/short-links-api";

export default function Page() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const payload = shortenLinkRequestSchema.safeParse({
      url: formData.get("url"),
    });

    if (!payload.success) {
      setError("Enter a valid URL.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await shortLinksApi.create(payload.data);

      const searchParams = new URLSearchParams({
        shortLink: result.shortLink,
      });

      router.push(`/shortened?${searchParams.toString()}`);
    } catch (error) {
      if (error instanceof ShortLinksApiError) {
        setError(error.message);
      } else {
        console.error("Unexpected error while creating a short link.", error);
        setError("Unable to reach the shortening service. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16 sm:px-8">
      <section
        aria-labelledby="landing-heading"
        className="w-full max-w-2xl text-center"
      >
        <Wordmark />

        <h1
          className="mt-8 text-3xl font-medium tracking-tight sm:text-4xl"
          id="landing-heading"
        >
          Make long links short.
        </h1>

        <p className="mx-auto mt-3 max-w-lg text-base leading-7 text-foreground-muted sm:text-lg">
          Paste a long URL and get a clean, shareable link.
        </p>

        <form
          aria-busy={isSubmitting}
          aria-label="Shorten a URL"
          className="mx-auto mt-10 w-full"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="sr-only" htmlFor="url">
              URL to shorten
            </label>
            <Input
              autoComplete="url"
              className="min-w-0 flex-1"
              id="url"
              name="url"
              placeholder="https://example.com/a/very/long/link"
              required
              spellCheck={false}
            />
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Shortening…" : "Shorten link"}
            </Button>
          </div>
        </form>

        <div aria-live="polite" className="mt-5">
          {error ? (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
