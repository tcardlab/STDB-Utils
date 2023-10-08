# STDB-Utils
TS/JS utilities for [SpacetimeDB (STDB)](https://spacetimedb.com/)<br/>
( This repo has no official association with STDB )

> **NOTE:** This is entirely experimental. I'm not advocating for any of these ideas in particular, I'm just playing around. <u>The repo may be subject to radical changes at any time.</u>

<br/>

### Getting Started:
```sh
npm i
npm start -w template/my-util 
# or any other pkg directory

# you can select other scripts in dev/ too
npm start -w pkg_path dev_script_name

# after you've ensured everything has been initialized
# you can use start:Min to skip steps on subsequent launches
npm run start:Min -w pkg_path dev_script_name
```

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
    <th colspan="3">Vite</th>
  </tr>
  <tr>
    <td><a href="https://github.com/tcardlab/STDB-Utils/tree/Dev(tmp)/framework/vire-hmr">Vite-HMR</a></td> 
    <td>Handles hot module reloading to clear events and persist STDB connection between updates</td> 
    <td>Need to make into functions</td>
  </tr>
  <tr>
    <th colspan="3">Solid</th>
  </tr>
  <tr>
    <td><a href="https://github.com/tcardlab/STDB-Utils/tree/Dev(tmp)/framework/solid-table">Solid-Table</a></td> 
    <td>Shallow reactive wrapper for STDB Tables</td> 
    <td>Pretty good I think</td>
  </tr>
  <tr>
    <td><a href="https://github.com/tcardlab/STDB-Utils/tree/Dev(tmp)/framework/solid-db">Solid-DB</a></td> 
    <td>Deep reactivity by replacing STDBs cache default method</td> 
    <td>Weak typing, but functional. Might make a per-table function and a client wrapper as a secondary function.</td>
  </tr>
  <tr>
    <td><a href="https://github.com/tcardlab/STDB-Utils/tree/Dev(tmp)/framework/solid-curry">Solid-Curry</a></td> 
    <td>again idk...</td> 
    <td>its wrapped.</td>
  </tr>
  <tr>
    <th colspan="3">HTMX</th>
  </tr>
  <tr>
    <td> HTMX-Plugin </td> 
    <td> WIP </td> 
    <td> coming soon... </td>
  </tr>
  <tr>
    <th colspan="3">Mitosis</th>
  </tr>
  <tr>
    <td> ... </td> 
    <td> ... </td> 
    <td> ... </td>
  </tr>
<table>

<br/>

## Deving

<details closed>
<summary> My dev notes... </summary><br/>

My Primary focus at the moment is just Utilities and DX.<br/> 
If we get into UI Components, we should probably give [Mitosis](https://github.com/BuilderIO/mitosis) a look (might even use it for some utils, TBD). I am still not sure how to coordinate integrations with potentially relevant WASM Modules as well as designing components that are relatively schema agnostic.


I'm open to restructuring the repo organization, I simply figured this is a reasonable starting point (Most others simply put everything in a `packages/{util}` directories. I might consider `packages/vanilla/{util}` later on).


### CLI CMDS
Learn about [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces)

```sh
# Init
npm i

# Install lib to workspace
npm i {somePackage} -w vanilla/hmr
# Note - Redundant pkgs will install in root: 
# https://stackoverflow.com/a/73490576 
# Note - peer deps must still be managed manually...

# Init workspace
npm init -w ./solid/* 
# not actually sure if this works or 
# if /* needs to be done manually 

# Install local pkg
npm i @vanilla/hmr -w solid/solid-db

# Update across pkg's
npm update @clockworklabs/spacetimedb-sdk --workspaces --include-workspace-root --save

# Ways to run start
npm start -w vanilla/hmr
npm start vanilla/hmr
cd vanilla/hmr && npm start

# And other scripts
npm run {some:Script} -w vanilla/hmr
npm run {some:Script} vanilla/hmr
cd vanilla/hmr && npm run {some:Script}

# See What will be packed
npm pack -w vanilla/hmr --dry-run

# publish to npm
npm publish -w vanilla/hmr --access=public # --dry-run=true
```

</details>

<br/>


## Acknowledgments

Thanks to the [SpacetimeDB Team](https://github.com/clockworklabs/SpacetimeDB) for putting up with all my questions!
  - [site](https://spacetimedb.com/)
  - [Discord](https://discord.gg/spacetimedb)
  - [company](https://clockworklabs.io/)

<br/>

### Repo Heavily inspired by:
- [Solid-Primitives](https://github.com/solidjs-community/solid-primitives)
  - [Site](https://primitives.solidjs.community/)
- [SolidJS-Use](https://github.com/solidjs-use/solidjs-use)
  - [site](https://solidjs-use.github.io/solidjs-use/)
- [Vue-Use](https://github.com/vueuse/vueuse)
  - [Site](https://vueuse.org/)
