/*
  spacetime DB table events don't pass the rowPK
  // https://github.com/solidjs-community/solid-primitives/tree/main/packages/websocket#readme

  Wait, this is way more agnostic than I thought. ReactiveMap is the only 
  framework specific dep. I might move this to vanilla mane make a solid wrapper.
*/
import { } from 'solid-js'
import { ReactiveMap } from '@solid-primitives/map';
import { __SPACETIMEDB__, Identity } from '@clockworklabs/spacetimedb-sdk';

// maybe I'll make a variant that just uses plain objects
// or rather store/signal
// Maps are kind of a pain to deal with

let valParse = (v:any) => {
  if (v instanceof Identity) {
    return v.toHexString()
  }
  if (typeof v === 'bigint') {
    return v.toString()
  }
  return v
}

let dbOpParse = (row:any) => {
  Object.entries(row).map(([k, v]:[string, any])=>{
    if (v instanceof Identity) {
      return row[k] = v.toHexString()
    }
    if (typeof v === 'bigint') {
      return  row[k] = v.toString()
    }
  })
  return row
}

let toSolidMap = (row:any) => {
  let sanitized = dbOpParse(row)
  return new ReactiveMap(Object.entries(sanitized))
}

import.meta.hot?.on?.('vite:beforeUpdate', ()=>{
  for (let [name, table] of __SPACETIMEDB__.clientDB.tables) {
    console.log('count:', table.emitter.listenerCount('solid-update'))
    table.emitter.removeAllListeners('solid-update')
  }
})

export interface Comp extends ReactiveMap<String, any> {
  on:(channel:string, cb:(...args:any[])=>void)=>void;
  emit: (channel:string, v:any, oldV:any, ReducerEvent:Red)=>void;
  rm: ()=>void;

  toArray: ()=>void;
  rows: ()=>any[];
  toObject: ()=>Record<string, any>;
  stringify: ()=>string;
  filter: (cb:(col:string, val:any)=>boolean)=>any[];
  filterKV: (col:string, val:any)=>any[] //Table[];
}

export function solidifySTDB(client: sClient, dualDB:boolean|string[]=false ) {
  if ( client.solidified  ) return console.log('Already Solidified')
  client.solidified = true
  console.log('Solidifying')

  for (let [name, table] of client.db.tables as Map<string, any>) {
    let isDualDB = dualDB===true || (Array.isArray(dualDB) && dualDB?.includes(name))

/***   Init Table DB Instance   ***/
    let solidDB = (new ReactiveMap<String, ReactiveMap<String, typeof table>>() as Comp)
    table.solidDB = solidDB
    let component = __SPACETIMEDB__.components.get(name)
    component.solidDB = solidDB

    solidDB.on = table.emitter.on
    solidDB.emit = table.emitter.emit
    solidDB.rm = table.emitter.removeAllListeners
    import.meta.hot?.on?.('vite:beforeUpdate', ()=>{
      solidDB?.rm?.()
    })


/***   Helpers   ***/
    solidDB.toArray = () =>{
      return Array.from(solidDB).map(([k,v])=>[k, Array.from(v) ])
    }

    solidDB.rows = () =>{
      return Array.from(solidDB).map(([k,v])=>v)
    }

    solidDB.toObject = () =>{
      return Object.fromEntries(
        Array.from(solidDB).map(([k,v])=>[k, Object.fromEntries([...v]) ])
      )
    }

    solidDB.stringify = ()=>{
      let Obj = Object.fromEntries(Array.from(solidDB).map(([rowPk, row])=>[
        rowPk, 
        Object.fromEntries([...row].map(([col,v])=>[
          col,
          valParse(v)
        ]))
      ]))
      return JSON.stringify(Obj)
    }

    solidDB.filter = (cb)=>{
      let filtered:any = []
      solidDB.forEach((v,k)=>{ if (cb(v,k)) filtered.push(v) })
      return filtered
    }

    solidDB.filterKV = (column:string, value:any)=>{
      let filtered:any = []

      solidDB.forEach((rowData, pkRowID)=>{
        if (rowData.get(column) === value) filtered.push(rowData)
      })

      return filtered
    }



/***   DB Events   ***/
    let ogInsert = table.insert
    table.insert = (dbOp:DBOp, reducerEvent:Red)=>{
      let row = toSolidMap(dbOp.instance)

      table.solidDB.set(dbOp.rowPk, row)
      solidDB.emit?.("solid-insert", row, null, reducerEvent);

      if(isDualDB) ogInsert(dbOp, reducerEvent)
    }



    let ogUpdate = table.update
    table.update = (dbOp:DBOp, dbOpOld:DBOp, reducerEvent:Red)=>{
      var row;
      SetMethod : {
        /* let oldRow = table.solidDB.get(dbOp.rowPk)
        oldRow = toSolidMap(dbOp.instance)
        
        table.solidDB.set(dbOp.rowPk, oldRow)
        table.solidDB.delete(dbOpOld.rowPk)

        var row = oldRow
        solidDB.emit("solid-update", ()=>table.solidDB[dbOp.rowPk], oldRow, reducerEvent); */
      }
      SwapOld : {
        // to preserver reactive tracking, we update the old value,
        // then we transfer it to the new rowPk
        var oldRow:any = table.solidDB.get(dbOpOld.rowPk)
        let oldCopy = new ReactiveMap(oldRow)

        // if we used an object/store, this would've been a trivial destructure
        for (let [k, v] of Object.entries(dbOp.instance)) {
          let oldV = oldRow.get(k)  // old vals should be safe
          let safeV = valParse(v)
          if ( oldV !== safeV) {
            oldRow.set(k, safeV)
            solidDB.emit?.("solid-update-v", [k, safeV], [k, oldV], reducerEvent);
          }
        }
        table.solidDB.set(dbOp.rowPk, oldRow)
        table.solidDB.delete(dbOpOld.rowPk)

        var row:any = oldRow
        solidDB.emit?.("solid-update", row, oldCopy, reducerEvent);
      }

      if(isDualDB) ogUpdate(oldRow, dbOp, reducerEvent)
    }



    let ogDelete = table.delete
    table.delete = (dbOp:DBOp, reducerEvent:Red)=>{
      let row = table.solidDB.get(dbOp.rowPk)
      table.solidDB.delete(dbOp.rowPk)

      solidDB.emit?.("solid-delete", null, row, reducerEvent);

      if(isDualDB) ogDelete(dbOp, reducerEvent)
    }
  }
}
