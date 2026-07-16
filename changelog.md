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

Architecturally, we're going also going to implement the necessary ports and adapters to achieve testability.

## Feat: Integrate shortcode generator with backend api
So the nice thing about our ports and adapters architecture is that we can create specific instances to serve specific use cases, without having to rewrite parts of our code.
We have, through the use of interfaces, defined WHAT the code has to do, not the HOW it has to achieve it. 

I personally find this elegant. At the end of the day, software engineering is very similar to logistics. We have to transport some data from point A to B to C. We can choose how it happens, e.g land/sea/air, but we don't have to know whether our pilot is named "John" or whether the truck's license plate ends with "123". We define a contract and it's terms, someone else can take care of the implementation.

In this iteration we hooked up our shortcode generator to the backend api, so given an url like:
https://www.example.com
It will get shortened to something like:
https://sloppify.com/VPELFqt

But for now it's purely cosmetic, because:
1) We don't persist the link or it's shortened form anywhere
2) We don't redirect when actually opening the shortened link

Let's tackle both of these issues in the next commit.

## Feat: Add Supabase and tables
As mentioned in the README.md, for the following app, in order to save time, a database provider will be used: Supabase. 

Although cloud providers, such as AWS, provide us greater control over hosting and capacity management, and perhaps even help in regulatory environments, our use case and operating environment is relatively simple and straightforward. 

But care should still be taken, to ensure first of all that we don't allow public access to the database itself, but rather expose it via an API. Secondly, we still want to employ "defensive coding" strategies in case we ever want to switch implementations, should we outgrow supabase or should supabase diverge too far from their current terms that we find acceptable. 

As a business, over reliance on a single supplier makes you fragile and ideally should be avoided.

For our purposes, we installed the @supabase/server package to the repo. We will not use it directly, but rather wrap it in OUR ports and adapters architecture. 

Indirection? Yes. But thought experiment, imagine: 
- You are a coffee shop and you sell coffee to customers
- You buy a coffee beans, a commodity, from another business

Would you be happy that your bean supplier would dictate the terms between you and your customer?

Would you sign a contract that would state "You must remain an exclusive partner and you can never buy beans from any other supplier." Perhaps if I was under immense time pressure or I just wanted to start a pop up coffee stall for a week, to test the market, then yes.

Miscellaneous changes:

**Update README.md**
Added instructions on how to init and run the project on local machine, given the newly added supabase dependency.

**Add migrations**
Good practice any time we have to deal with relational databases. Thankfully supabase makes this process straightforward.

**Add Supabase specific repository for storing created links**
Thanks to the ports and adapters approach it was very straghtforward to set up a relational database layer to the existing app.

## Feat: Add shortlink retrieval and redirect
We are approaching the end of building our super simple & naive url shortener. As the final use case, we have to:
- Retrieve the original url from the database when navigating to https://example.com/[shortCode]
- Redirect user to the original URL

If you've been following along so far, then implementing the final features may already be familiar for you, but to recap:
- Add db migration to allow service_role to read the short_links table
- Add a new inbound use case for reading the short link from table (user triggered)
- Update our short-link-repository to accomodate for reads
- Update tests
- Create a nextjs GET route with a redirect

After this commit, we have a functional URL shortener. So let's revisit the user stories and see which ones are left:
- to submit a link and receive a shortened link in return ✅
- to be redirected to the original link when shortlink is opened ✅
- to use the link shortener on mobile (responsive design, etc...) ✅
- the app to be clear and easy to use (UI/UX) ✅
- the app to be robust (unit/integration/e2e tests) ✅
- the app to persist the links over a long period of time (Database) ✅
- the app to be production ready (deployed somewhere) 🚫

So after this the only thing that's left from the users perspective is to deploy.

## Feat: Downgrade PNPM
Unfortunately for us, nextjs doesn't support pnpm 11 yet. The latest they support is pnpm 10.
So we will have to change our package.json to reflect that and reinstall our dependencies.
But it shouldn't be a dealbreaker, since we're not relying on any of the major features pnpm 11 introduced.
We will have to commit and push our changes though for the next step.

## Feat: Deploying to production
So this is the culmination of our efforts, shipping something tangible to the users.
As mentioned before, we're not going to the lengths of setting up a server box ourselves,
although the door is open for us in case we ever want to do so; both Supabase and NextJS are self hostable.

For this simple demo, I think it may be bit of an overkill. 
Self hosting, In my opinion makes sense once we PROVE our product, meaning:
1) Our app has daily amount of recurring users
2) The cost of hosting our app on one of these platforms becomes unbearable
3) We have in-house specialization for infra
4) We somehow GAIN in velocity
5) We are under some unique regulatory constraints

When we evaluate our link shortener against any of these criteria, currently, I don't think there are enough reasons to consider self hosting.

### Supabase
Let's first tackle the database deployment, since our frontend/backend depend on it.
If you're following along then you first need to set up an account with supabase and create a new project.
I think the official docs will do a better job on explaining how to achieve this than, I can put down in writing here.

But once you have everything set up, you want to:

**Login to your supabase account**
We will authenticate with supabase in order for us to proceed with creating the necessary tables via migration scripts instead of manually clicking through everything.
```bash
pnpm exec supabase login
```

**Link your local project to the cloud project**
Let's link our local project to the cloud project. This command doesn't do anything fancy,
it just creates a file at supabase/.temp/project-ref. Essentially we just tell the supabase CLI,
when we're running any db commands when communicating with the cloud, that is the project ID we want
to run our commands against.
```bash
pnpm exec supabase link --project-ref YOUR_PROJECT_REF_FROM_THE_CLOUD
```

**Test run the migrations**
Of course, before running migrations, it's a good idea to check which migrations will actually be run, in order to avoid data loss.
```bash
pnpm exec supabase db push --dry-run
```

**Actually run the migrations**
Ideally, this command would be ran inside an automated CI/CD pipeline with permissions and OIDC auth, but I think that would also expand the scope of this project a bit too much. But even then it's not "dark magic".
Plus a CI/CD is something you don't edit on a regular basis, but rather when your project requirements drastically change.
```bash
pnpm exec supabase db push
```
So I will now go ahead, and take the leap of faith and run the migrations :)
And it looks like the migrations ran successfully.
We have an identical table setup in "production" as we do in our local "dev" environment.

### Vercel Cloud
Next up, let's tackle the frontend/backend deployment.
Which is a bit more involved.

We first need to import our project into vercel cloud. 
Currently, the vercel deploy is intelligent enough to deduct all the necessary default values on its own.
So thankfully we don't have to modify anything.

The only thing that we DO have to do is to import our environment variables.
So let's make sure we include add all 4:
```bash
SHORT_LINK_BASE_URL=
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
```

If we add all these and deploy our project to vercel, it should complete successfully.
In my case it did.

Which means as the final thing left to do is to 
1) Configure the DNS  
2) Validate our link shortener works in production

And now the project is accessible at https://www.sloppify.com :)

Which means, we have fulfilled our last user requirement:
- the app to be production ready (deployed somewhere) ✅