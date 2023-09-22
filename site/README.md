TBD

Will probably be borrowing heavily from [solid-primitives](https://github.com/solidjs-community/solid-primitives/tree/main/site).<br/>
Solid community just does things right.

Although, I may use vite to generate the pages?

I do like the sidebar in [vueuse](https://vueuse.org/shared/createGlobalState/).<br/>
Might be worth looking into [vitepress](https://github.com/vuejs/vitepress)
as well.

The embedded Demos in VueUse are cool too, but I don't think that is applicable for utilities. Eventually, It would be cool to create UI components as well. We gotta make sure they are table/schema agnostic and may have to ship it alongside the backend module/reducer code. Luckily, WASM is lang agnostic but I am not sure about the specifics of imports and implementation.