/*
  shallow reactive arr that updates table on STDB events
  this enables us to use the solid-js reactive system to 
  listen and respond to updates automatically (notably in the dom).

  I also added a `.values()` helper method to tableStore
  the reason for this is that `tableStore.all()` returns an datatype.
  `.values()` is just quick access to a plain array type.

  If we had the rpk values exposed we might be able to better 
  filter/memoize relevant updates on rows listeners. Thats just 
  hypothetical, not 100% sure how I'd implement that just yet.
*/

import { onCleanup, createSignal, createMemo } from 'solid-js'

// Tracker has least memory overhead?
export function solidTableTracker<T extends Table>(table: I<T>) {
  // Register and Trigger reactive updates
  let [track, dirty] = createSignal(undefined, {equals: false});

  let cb = dirty
  table.onInsert(cb)
  table.onUpdate(cb)
  table.onDelete(cb)

  let destroy = ()=>{
    table.removeOnInsert(cb)
    table.removeOnUpdate(cb)
    table.removeOnDelete(cb)
  }
  onCleanup(destroy)

  function getter() { 
    track()
    return table || null 
  }
  getter.values = () => {
    track()
    return table ? [...table.all()] : []
  }

  return [getter, destroy] as [typeof getter , ()=>void]
}


export function solidTableSignal<T extends Table>(table: I<T>) {
  // Reactive Wrapper
  let [tableStore, setTableStore] = createSignal<IN<T>>(table, {equals: false});

  // Shallow, Reactive Overwrite
  let cb = ()=>setTableStore(()=>table)
  table.onInsert(cb)
  table.onUpdate(cb)
  table.onDelete(cb)

  let destroy = ()=>{
    table.removeOnInsert(cb)
    table.removeOnUpdate(cb)
    table.removeOnDelete(cb)
    setTableStore(null)
  }
  onCleanup(destroy)

  function getter() { return tableStore() }
  getter.values = createMemo(() => {
    let tmp = tableStore();
    return tmp ? [...tmp.all()] : []
  })

  return [getter, destroy] as [typeof getter , ()=>void]
}


export function solidTableDB<T extends Table>(table: T) {
  // Register and Trigger reactive updates
  let [track, dirty] = createSignal(undefined, {equals: false});

  let cb = dirty
  table.onInsert(cb)
  table.onUpdate(cb)
  table.onDelete(cb)

  let destroy = ()=>{
    table.removeOnInsert(cb)
    table.removeOnUpdate(cb)
    table.removeOnDelete(cb)
  }
  onCleanup(destroy)

  let dbTable = __SPACETIMEDB__.clientDB.getTable(table.name)
  function getter() { 
    track()
    return dbTable || null 
  }
  getter.values = () => {
    track()
    return Array.from(dbTable.getInstances())
  }

  return [getter, destroy] as [typeof getter , ()=>void]
}


/*** They are all functionally equivalent, bu idk wut the best return type is ***/
export const solidTable = solidTableTracker    // Track clean and dirty states reactively and in an expressive way.
// export const solidTable = solidTableSignal  // Prob equivalent to the tracker, but less clear imo
// export const solidTable = solidTableDB      // returns a different form of the table that has .getInstances() method exposed
