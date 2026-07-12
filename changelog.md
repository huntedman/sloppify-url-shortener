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