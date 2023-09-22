import { __SPACETIMEDB__ } from "@clockworklabs/spacetimedb-sdk";

let hmrCleanup = (cb: ()=>void)=>{
  import.meta?.hot?.on?.('vite:beforeUpdate', cb)
}

export function onInsert<T extends Table> (
  cb: CB<T>, depArr: I<T>[]
) {
  let normCB = (v:I<T>, red:Red)=>{cb(v, null, red)}
  for (let table of depArr) {
    table.onInsert(normCB)
  }

  let unsub = () => {
    for (let table of depArr) {
      table.removeOnInsert(normCB)
    }
  }
  hmrCleanup(unsub)

  return unsub
}

export function onUpdate<T extends Table> (
  cb: CB<T>, depArr: I<T>[]
) {
  let normCB = (vOld:I<T>, v:I<T>, red:Red)=>{cb(v, vOld, red)}
  for (let table of depArr) {
    table.onUpdate(normCB)
  }

  let unsub = () => {
    for (let table of depArr) {
      table.removeOnUpdate(normCB)
    }
  }
  hmrCleanup(unsub)

  return unsub
}

export function onDelete<T extends Table> (
  cb: CB<T>, depArr: I<T>[]
) {
  let normCB = (vOld:I<T>, red:Red)=>{cb(null, vOld, red)}
  for (let table of depArr) {
    table.onDelete(normCB)
  }

  let unsub = () => {
    for (let table of depArr) {
      table.removeOnDelete(normCB)
    }
  }
  hmrCleanup(unsub)

  return unsub
}

export function onInit (
  cb: ()=>void
) {
  let client = __SPACETIMEDB__.spacetimeDBClient
  if (!client) throw new Error('spacetimeDBClient is undefined')
  
  client.on('initialStateSync', cb)

  let unsub = () => {
    client?.off?.('initialStateSync', cb)
  }
  hmrCleanup(unsub)

  return unsub
}


export function onChange<T extends Table>(
  cb: CB<T>, depArr: I<T>[], init?: false|(()=>{})
) {
  
  let rmIns = onInsert(cb, depArr)
  let rmUpd = onUpdate(cb, depArr)
  let rmDel = onDelete(cb, depArr)

  let rmInit = ()=>{};
  if (init) rmInit = onInit(init)

  let unsub = () => {
    rmIns()
    rmUpd()
    rmDel()
    if (init) rmInit()
  }

  return unsub
}
