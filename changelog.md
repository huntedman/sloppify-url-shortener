# Changelog
I wanted to provide some step by step reasoning along side this repository to give you a feel of how I think, reason about things and approach solving problems.

This file will include each commit title along with explanation of my thoughts and "why". 
I think this would be easier to digest, than having to shift through commit messages and trying to cross reference what happened in the last iteration.

## Feat: Create a minimal ports and adapters architecture scaffolding
The first "real" commit is about establishing the architecture and the structure of the code in this repository.
It adds the most basic and rudimentary service, that doesn't do anything useful, but demonstrates the flow of data throughout the application and how the different dependencies are structured.

I wanted to have "something" tangible to rely on when going forward, and having the core domain in place I feel gives enough tangibility for starting out strong.

## Feat: Add a rudimentary UI
We were about to implement some code that would actually DO something and now we jump to implementing the UI and hooking up the API to something half baked and functionally useless. Why?

Two reasons, based on my personal opinion:
1) We want to understand the application and it's behavior from the end USERS perspective.
2) We want to ensure our implementation and abstractions can be hooked up to the end behaviour. 

We are, at the end of the day, building an application for USERS. That means if we don't consider the users' perspective early on, we might end up with the wrong abstractions or with the wrong requirements. E.g we may forget that an user has to in addition to the url provide an email address or something to identify the user by.

Secondly, we want to know early on whether our implementation CAN be glued together as intended. It wouldn't be the first time for me to devise an approach and learn later on that it's clumsy to hook up with the "endpoint".

To generate the UI, claude's design feature was used. It came up withe the deadpan_deli.html design brief.

I prompted it to do the following:
"Help me come up with an exploratory branding, color and type pairings for my application "Sloppify". It's an URL shortener that functions similar to bit.ly

I want mine to be a bold and whimsical take on the concept of url shortening. So I'll need a brand voice and some creative ideas on how to frame it as "whimsical" but not "offensive". "Approachable", but "quirky". "bold" but not "arrogant". Feel free to go "wild"."

I chose a design direction I liked, then used codex to extract the different colors into tailwind color tokens and to remove the base tailwind colors from the theme. This way whatever UI we decide to design or add later, will stay cohesive with the rest and we can simply re-theme the site later when deemed necessary.

I then created a more minimal landing page, cutting away the unnecessary "fluff". I find that AI can provide a good starting point for designs, but it tends to add a lot of un-necessary noise to the designs. This is just one place where I find it easier to hand tweak the generated code, rather than painfully explain every microdetail to change.

## Feat: Hook our dummy service up with our frontend app
Next up we will move on to implementing the API route in the nextjs app to our link shortener service. We will not change the service to do anything useful yet at this stage. It will simply return the input to the user in a new page.

This stage is useful as a sanity test for whether our chosen approach to the problem works "end to end".

**Introduced "domain-core" package import guardrails**
We don't want our frontend app to accidentally import our core backend logic. It's a good enough fix for our current approach to avoid this sort of accidents.

**Introducing a "shared-contracts" package**
This is a package that establishes the boundary between the frontend and backend. It provides the request and response shapes of the objects that our backend api (in our case NextJS) expects.

A question might arise: Why yet another package? Why not use what we already defined in our modules/short-links/applications/ports/inbound?

i.e these:
```typescript
export interface CreateShortLinkCommand {
  url: OriginalUrl;
}

export interface CreateShortLinkResult {
  shortLink: ShortLink;
}
```

Well, simply because, these are internal details of our backend application. The frontend should never know what's happening in our backend. Otherwise our frontend is "coupled" to our backend and any changes made to our backend would affect our frontend also. 

For example, let's imagine for a second that the CreateShortLinkCommand would also accept another parameter for generating random url suffixes. Then our frontend would also know or have to provide a suffix generator, which would be wrong. In my experience, it's better to explicitly define a shared contract between the frontend and the backend app up front, so expectations are clear for both.

The contract would be shared, because this way we can do validation on both fronts:
1) in the frontend when user is submitting, to provide them a hint about the expected shape of the payload
2) in the backend after the user has submitted to avoid someone abusing our API and to keep our domain intact.

**Establish reusable UI components**
Eventhough we use style tokens to style our UI, it's still a good practice to establish a componenting system for the different UI elements of our app. Because as our app and the amount of style tokens grow, so does the amount of permutations for combining theses style tokens into UI elements grow. We want to have a single source of truth for some primitives, e.g "button", "input", "title", etc...

## Feat: Break the frontend's coupling to nextjs "api" routes
We keep treating elements coupled together as something to avoid. Well at least, I do personally. Why? Because they become patterns in our codebase that others will become reliant on. Being reliant on wrong principles will cause immeasurable effects down the line.

In this instance I don't mean the word immeasurable in the context of "something so big that it cannot be measured", but rather in the context that "the exact size of the effect is difficult it not possible to measure".

For example, I can exactly measure the time of how long it would take me to factor out, how we currently call our backend API for getting a shortened link. It took me less than a minute to remove this coupling.

Let's say now 6 months pass, and this sort of pattern becomes the norm in our codebase and we don't have one API endpoint anymore, but 10 and 5 other developers in 10 different places rely on interfacing with our backend by inlining API calls like so:
```ts
const response = await fetch("/api/shorten-link", {
  body: JSON.stringify(payload.data),
  headers: { "content-type": "application/json" },
  method: "POST",
});

const result = (await response.json()) as ShortenLinkResponse;
```
On top of this, it doesn't even make sense in the first place, for our page to have to know the details about the exact order of operations and the ceremony for calling our api. It just needs to know what does our API expect and what does it return.

And now lets assume our demand grows drastically and we need to switch from our current nextJS api routes to a dedicated API server in 5 different places. It would definitely take more than a minute to switch. I think a wider philosophical discussion is to be had here: as humans, we often only measure the immediate costs of fixing something and not care enough about the cost over time. In other words we can be blinded by the "present bias" or "Penny-wise, pound foolish" logical line of reasoning. 

That being said... every approach has it's limits and we should definitely focus on getting useful work in.
I know it can seem a bit hyperbolic or even paranoid, but I just wanted to use the preceeding example to illustrate my thinking process a bit more.

## Feat: Implement our own ShortCode generator

Let's take a lookt at what a bit.ly link looks like.
I created some links on different days.

bit.ly/4vzDxfa
bit.ly/4eYHjtr
bit.ly/4eWk8jk
bit.ly/4yiKtzM
bit.ly/4510mNG
bit.ly/4fwG3hd

The Bitly codes show no directly observable time based ordering. This does not rule out timestamps or sequences as internal inputs, but it can suggest that the public identifier is deliberately unique and opaque.

From these examples, we can probably assume that the generated codes are:

- 7 characters long 
- Alphanumerical and case-sensitive (A-Z | a-z | 0-9)

Meaning if all lowercase and uppercase leters and digits are allowed the alphabet would be base62:
26 lowercase characters
26 uppercase characters
10 numerical characters
= 62 possible combinations 
Given 7 characters, it means there's 62^7 possible combinations.
Which is approximately ~3.52 trillion combinations.

A Unix timestamp in milliseconds currently fits within this numeric range, so timestamp encoding is one possible approach. It's a simple one to implement, can be scaled across different servers (if database unique constraint is in place) and we can easily extend or modify it as long as we don't give any guarantees about the id's to our users. It is an intentionally simple, time based identifier, not a random or secure identifier.

The draw back of our approach is that we're going to run out of ID's by the year 2081. We're also leaving a lot of ID's unused, so we will have exhausted half of the remaining pool of unique ID's by ~2053, and WHAT IF our service become so popular that we're generating more than 8.64e+7 links per day? Well... I'd say let's cross that bridge when we get even remotely close to it and deploy the necessary engineering resources then. 

If we somehow become popular in a year, we will have a deterministic amount exhausted ID's and we can figure a way around it. Let's keep it simple for now.

Architecturally, we're going also going to implement the necessary ports and adapters to achieve testability. We're passing in our 