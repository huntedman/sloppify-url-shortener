# Sloppify (URL Shortener)

## How it works

Request - Shortened URL: https://sloppify.com/ogp
Response - Original URL: https://docs.google.com/document/d/abcdefg

## User stories

As an user I want:

- to submit a link and receive a shortened link in return
- to be redirected to the original link when shortlink is opened
- to use the link shortener on mobile (responsive design, etc...)
- the app to be production ready (deployed somewhere)
- the app to be clear and easy to use (UI/UX)
- the app to be robust (unit/integration/e2e tests)
- the app to persist the links over a long period of time (Database)

## Techstack

At the highest level of abstraction, In order to satisfy the user stories, the following stack is proposed:

- Frontend application - NextJS
- Styling - Tailwind CSS
- Backend application - NextJS
- Database - Supabase

### Frontend & Backend

NextJS was chosen as the framework for building the frontend app, because

- It provides a robust routing capabilities out of the box
- It is straightforward to self-host
- I am familiar with NextJS and know it inside out
- NextJS provides backend "capabilities" out of the box (api routes)

The biggest win for this project, in my opinion, by using NextJS, is we don't need to manage a separate backend server or machine. This means there's one less service to manage and be reliant on. We don't have to worry about the communication between different services. We don't have to set up a VPC, subnets, different routing permissions, CORS, etc... All of these are small things on their own, but quickly add complexity to an app that could have been kept simple.

The main tradeoff of this approach is that we couple the backend with frontend.

Coupling these together means we can't scale the backend independently from the frontend anymore. For example, if the backend load would grow faster than the frontend, when the frontend effectively could be a static site deployed in an S3 bucket, we're forced to deploy a "bigger" instance just because backend needs it.

Second drawback is that the NextJS app routes function more like "serverless" one-off jobs, meaning they are stateless and don't natively support something like a "cronjob". Each execution starts off from a clean slate, so we have to query the DB each time and if it's a complicated query it can add unnecessary delays.

But let's not overcomplicate and overthink about these issues for now. We're just building an url shortener :)

### Database

For database supabase was chosen. Again because of the simplicity of getting started.

- I don't have to set up VPC and subnets
- I don't have to manage an RDS instance
- I don't have to manage backups
- It's easy to connect to

The only thing to watch out for with supabase is we don't become too reliant on their "add-on" services.
For example, supabase allows us to build a fully functional backend using their postgres "row level security".
It's a great concept, but in practice, we couple our "business" together with theirs.
Meaning, if the VC funded startup, at some point decides to "cash in" or start doing things we don't agree with, our whole backend will essentially be hostage.

My general philosophy is not to become over-reliant closed services, but again, let's not think that far ahead, keep the risks in mind, and build the URL shortener :)

## A note on architecture (Ports And Adapters)

I want to clarify the thought process behind my decision to go with this, to some controversial, decision.

It might seem like an overkill, for such a simple app to start thinking about it in terms of "ports and adapters".
It adds abstraction, boilerplating, and confusion if you're not familiar with reasoning about the code in this way.

But at the same time, I find it forces us to think better about WHAT we're building and HOW we're going to structure our code.
It forces us to ask the questions like "where does this functionality belong?" and "what is the correct direction of dependencies?" before we write any code. A micro decision and foresight can save us from a ton of headache down the line.

It's also easier to test functionality, because anything can be "mocked" and dependency injected.
It's easier to extend our app with new features, because nothing is coupled together at the "fundamental" level and we don't have to think about how to "force" something in to our existing featureset.

The biggest tradeoff, by far of this approach, is that other team members may not be as familiar with this sort of frame of thinking when coding. I initially struggled. Because it can feel as if there's a weird ritual and boilerplating. Adding a new feature means we and have to make changes in multiple places.

But as the complexity of the app grows, the investment to understand, can pay off relatively quickly.

In our specific case, when we later decide to migrate away from "NextJS as backend" or "move away from postgres to mongodb" as our database provider, none of the "rituals" have to change. We would just have to write a different handler and swap it out in the adapter, keeping the overall flow intact.

## Development

This repository is scaffolded as a pnpm and Turborepo monorepo. It requires Node.js 24 and pnpm 11.

- `apps/frontend` contains the Next.js application.
- `packages/domain-core` is an empty TypeScript library boundary for future domain code.
- `packages/eslint-config` and `packages/typescript-config` contain shared tooling.

Run `nvm use` and `corepack enable` once to select the pinned runtime and package manager. Install dependencies with `pnpm install`, then use `pnpm dev` for local development. Run `pnpm check` to lint, type-check, and verify formatting, or `pnpm build` to create a production build.
