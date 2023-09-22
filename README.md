# STDB-Utils
TS/JS utilities for Spacetime DB

> NOTE: This is entirely experimental. I'm not advocating for any of these ideas in particular, I'm just playing around. The repo may be subject to radical changes at any time.

My Primary focus at the moment is just Utilities and DX.<br/> 
If we get into UI Components, we should probably give [Mitosis](https://github.com/BuilderIO/mitosis) a look (might even use it for some utils, TBD). I am still not sure how to coordinate integrations with potentially relevant WASM Modules as well as designing components that are relatively schema agnostic.

I'm open to restructuring the repo organization, I simply figured this is a reasonable starting point (Most others simply put everything in a `packages/{util}` directories. I might consider `packages/vanilla/{util}` later on).

I'm still not 100% sure how I want to handle running the dev mode eof each module.
I could create a single simple CRUD db shared across all of them
or I could create a individual ones for each...
idk...


### Heavily inspired by:
- [Solid-Primitives](https://github.com/solidjs-community/solid-primitives)
  - [Site](https://primitives.solidjs.community/)
- [Vue-Use](https://github.com/vueuse/vueuse)
  - [Site](https://vueuse.org/)

<br/>

### A quick note on why I created onChange listeners: <br/>
> Inserts and truthy updates can often be paired together as well as deletes and falsy updates. So, rather than dealing with 3 functions across 4 states, you can use 1 function across 2 states. I don't think it should be abused, but it has a use.