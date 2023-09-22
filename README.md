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


#### A quick note on why I created onChange listeners: <br/>
> Inserts and truthy updates can often be paired together as well as deletes and falsy updates. So, rather than dealing with 3 functions across 4 states, you can use 1 function across 2 states. I don't think it should be abused, but it has a use.

<br/>

## Packages:

<table>
  <tr>
    <th>Package</th> <th>Blurb</th> <th>Status</th>
  </tr>
  <tr>
    <th colspan="3">Vanilla</th>
  </tr>
  <tr>
    <td><a href="https://github.com/tcardlab/STDB-Utils/tree/Dev(tmp)/vanilla/http">Http</a></td> 
    <td>JS/TS HTTP client for STDB</td> 
    <td>Need to make class(s) & finish more endpoints</td>
  </tr>
  <tr>
    <td><a href="https://github.com/tcardlab/STDB-Utils/tree/Dev(tmp)/vanilla/hooks">Hooks</a></td> 
    <td>React like hooks with dep arrays</td> 
    <td>Good I think</td>
  </tr>
  <tr>
   <td><a href="https://github.com/tcardlab/STDB-Utils/tree/Dev(tmp)/vanilla/hmr">HMR</a></td> 
   <td>Handles hot module reloading to clear events and persist STDB connection between updates</td> 
   <td>Need to make into functions</td>
  </tr>
  <tr>
    <td><a href="https://github.com/tcardlab/STDB-Utils/tree/Dev(tmp)/vanilla/curry">Curry</a></td> 
    <td>IDK, just messing around</td> 
    <td>Idk if its work doing the rest of the events. would be easy tho.</td>
  </tr>
  <tr>
    <td><a href="https://github.com/tcardlab/STDB-Utils/tree/Dev(tmp)/vanilla/callback-db">callback-db</a></td> 
    <td>TBD - assigning callback getter and event set per row</td> 
    <td>WIP - still contemplating api and utility. I could use a uuid or increment as a key on the map rather than the RowPK, so is a getter any better than a map indexing?</td>
  </tr>
  <tr>
    <th colspan="3">Solid</th>
  </tr>
  <tr>
    <td><a href="https://github.com/tcardlab/STDB-Utils/tree/Dev(tmp)/solid/solid-table">Solid-Table</a></td> 
    <td>Shallow reactive wrapper for STDB Tables</td> 
    <td>Pretty good I think</td>
  </tr>
  <tr>
    <td><a href="https://github.com/tcardlab/STDB-Utils/tree/Dev(tmp)/solid/solid-db">Solid-DB</a></td> 
    <td>Deep reactivity by replacing STDBs cache default method</td> 
    <td>Weak typing, but functional. Might make a per-table function and a client wrapper as a secondary function.</td>
  </tr>
  <tr>
    <td><a href="https://github.com/tcardlab/STDB-Utils/tree/Dev(tmp)/solid/solid-curry">Solid-Curry</a></td> 
    <td>again idk...</td> 
    <td>its wrapped.</td>
  </tr>
<table>

<br/>

### Heavily inspired by:
- [Solid-Primitives](https://github.com/solidjs-community/solid-primitives)
  - [Site](https://primitives.solidjs.community/)
- [Vue-Use](https://github.com/vueuse/vueuse)
  - [Site](https://vueuse.org/)
