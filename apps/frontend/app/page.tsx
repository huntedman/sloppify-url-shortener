export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16 sm:px-8">
      <section
        aria-labelledby="landing-heading"
        className="w-full max-w-2xl text-center"
      >
        <p className="font-serif text-5xl font-medium tracking-tight sm:text-6xl">
          Sloppify<span className="text-accent">.</span>
        </p>

        <h1
          className="mt-8 text-3xl font-medium tracking-tight sm:text-4xl"
          id="landing-heading"
        >
          Make long links short.
        </h1>

        <p className="mx-auto mt-3 max-w-lg text-base leading-7 text-foreground-muted sm:text-lg">
          Paste a long URL and get a clean, shareable link.
        </p>

        <form aria-label="Shorten a URL" className="mx-auto mt-10 w-full">
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="sr-only" htmlFor="url">
              URL to shorten
            </label>
            <input
              autoComplete="url"
              className="min-w-0 flex-1 rounded-full border border-border-strong bg-surface px-6 py-4 text-base text-foreground transition-colors placeholder:text-foreground-muted focus-visible:border-focus"
              id="url"
              name="url"
              placeholder="https://example.com/a/very/long/link"
              required
              spellCheck={false}
            />
            <button
              className="rounded-full bg-action px-7 py-4 text-base font-semibold whitespace-nowrap text-action-foreground transition-colors hover:bg-action-hover"
              type="submit"
            >
              Shorten link
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
