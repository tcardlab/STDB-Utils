/*
  HMR may be an issue that can cause duplication of event listeners...
  not sure how I want to handle that yet.

  Also considering whether to add some sort of 'onInit' capability under the symbol '0'
  but idk if that requires client, which is a whole other thing to pass through...
  maybe I can call .all() on init
*/

/*
  Symbols explained:
    + : new row
    = : same row count, mutation
    - : remove row
*/

import type { Table, IN, Red, noop, I } from '~/global.ts';

let hmrCleanup = (cb: ()=>void)=>{
  import.meta?.hot?.on?.('vite:beforeUpdate', cb)
}

export type onChangeCB = <T extends Table>(e:string, v:IN<T>, vOld?:IN<T>, red?:Red)=>void
export interface curryCB {
  (cb: onChangeCB,
  filterBypass?:(()=>string[]) | string[],
  sub?:(()=>string[]) | string[]
  ): noop
}

export function curryChange<T extends Table> (table: I<T>) {

  const curryCB:curryCB = (
    cb, 
    // I know insert can have nullish ReducerEvents(Red), but can the others?
    // if not, this might just be a boolean
    filterBypass=[],    
    sub=['+','=','-']
  ) => {

    let insertCB = (v:any, red:Red) => {
      // Allow reactive subscription
      let activeSub = Array.isArray(sub) ? sub : sub();
      if (!activeSub.includes('+')) return

      // Allow reactive reducer filtering
      let filter = Array.isArray(filterBypass) ? filterBypass : filterBypass();
      if (!filter.includes('+') && !red) return

      // Standardized CB format
      cb('+', v, null, red)
    }
    // If sub arr is static, and symbol not included, we can skip it entirely
    if (!(Array.isArray(sub) && !sub.includes('+'))) table.onInsert(insertCB)


    let updateCB = (old:any, v:any, red:Red)=>{
      let activeSub = Array.isArray(sub) ? sub : sub();
      if (!activeSub.includes('=')) return

      let filter = Array.isArray(filterBypass) ? filterBypass : filterBypass();
      if (!filter.includes('=') && !red) return

      cb('=', v, null, red)
    }
    if (!(Array.isArray(sub) && !sub.includes('='))) table.onUpdate(updateCB)


    let delCB = (v:any, red:Red)=>{
      let activeSub = Array.isArray(sub) ? sub : sub();
      if (!activeSub.includes('-')) return

      let filter = Array.isArray(filterBypass) ? filterBypass : filterBypass();
      if (!filter.includes('-') && !red) return

      cb('-', null, v, red)
    }
    if (!(Array.isArray(sub) && !sub.includes('-')))  table.onDelete(delCB)

    
    let unSubChange = () => {
      // If sub was skipped, we can skip unsub
      if (!(Array.isArray(sub) && !sub.includes('+'))) table.removeOnInsert(insertCB)
      if (!(Array.isArray(sub) && !sub.includes('='))) table.removeOnUpdate(updateCB)
      if (!(Array.isArray(sub) && !sub.includes('-'))) table.removeOnDelete(delCB)
    }

    hmrCleanup(unSubChange)

    return unSubChange
  }

  return curryCB
}
