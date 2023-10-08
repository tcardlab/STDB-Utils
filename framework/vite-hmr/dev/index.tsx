// i don't really know how to dev/test hmr other than in prod...
console.log("HIT HMR DEV")

import { render } from "solid-js/web"
import { onMount, createSignal, For, Accessor, Setter } from "solid-js"
import { createStore } from "solid-js/store"

import { SpacetimeDBClient, Identity } from '@clockworklabs/spacetimedb-sdk'

// If you need to run a custom server, 
// you can define/get relevant info 
// from the local package "../package.json"
import { name, config } from "~/package.json"

import {
  UserTable,
  ThingTable,
  CreateUserReducer,
  SetNameReducer,
  CreateThingReducer,
  ToggleThingStatusReducer,
  DeleteThingReducer,
  UpdateThingContentReducer
} from "~/module_bindings/index.js"

/**  Init Client  **/
let token = localStorage.getItem('auth_token') || undefined;
console.log(config.host, name)
let client = new SpacetimeDBClient(config.host, name.replace('/','-'), token);


const App = () => {
  /**  Connect & Init  **/
  let local_id: Identity | undefined = undefined;
  client.onConnect((new_token, identity) => {
    console.log("Connected to SpacetimeDB");
    local_id = identity;
   
    // Create User on Init
    if (!token) {
      localStorage.setItem('auth_token', new_token);
      setTimeout(()=>{
        console.log("create user")
        CreateUserReducer.call(identity.toHexString().substring(0,8))
      }, 2e3)
    }

    client.subscribe([ "SELECT * FROM UserTable", "SELECT * FROM ThingTable" ])
  })
  onMount(()=>client.connect())


  /**  Handle init IDs  **/
  let [users, setUsers] = createStore<Record<string, UserTable>>({})
  let [self, setSelf] = createSignal<UserTable|null>()
  let upsert = (row:UserTable)=> {
    let ID = row.identity.toHexString()
    setUsers(ID, row)
    if (ID === local_id?.toHexString()) setSelf(row)
  }
  UserTable.onInsert((row, red)=>{
    console.log("new user in cache!");
    upsert(row)
  })
  UserTable.onUpdate((_, row, red)=>{
    console.log("updated user!");
    upsert(row)
  })


  /**  Update Name  **/
  let [edit, setEdit] = createSignal(false)
  let updateName = ()=>{
    let el = document.getElementById('set-self') as HTMLInputElement
    SetNameReducer.call(el.value)
    setEdit(!edit())
  }


  /**  Things  **/
  // nested reactivity: https://www.solidjs.com/tutorial/stores_nested_reactivity?solved
  let [things, setThings] = createSignal<{id:number, rVal: Accessor<ThingTable>; rSet: Setter<ThingTable>}[]>([])

  ThingTable.onInsert((row, red)=>{
    let id = row.thingId
    let [rRow, setRRow] = createSignal<ThingTable>(row)
    setThings(v=>([...v, {id, rVal:rRow, rSet:setRRow}]))
  })
  ThingTable.onUpdate((_, row, red)=>{
    let ID = row.thingId
    things().find(t => t.id === ID)?.rSet(row)
  })
  ThingTable.onDelete((row, red)=>{
    let ID = row.thingId
    setThings( things().filter(t => t.id !== ID) )
    rmEditThing(ID)
  })
  let newThing = ()=>{
    let el = document.getElementById('new-thing') as HTMLInputElement
    CreateThingReducer.call(el.value)
    el.value = ""
  }

  let [editThings, setEditThings] = createSignal(new Set(), {equals:false})
  let onEditThing = (id:number)=>setEditThings(v=>v.add(id.toString()))
  let isEditing = (id:number)=>editThings().has(id.toString())
  let rmEditThing = (id:number)=>setEditThings(v=>{v.delete(id.toString()); return v})
  let saveEditThing = (id:number)=>{
    let el = document.getElementById('thing-input'+id) as HTMLInputElement
    UpdateThingContentReducer.call(id, el.value)
    rmEditThing(id)
  }


  /**  Template  **/
  return (
    <div class="grid">

      <div class="self">
        <h3>Self:</h3>
        { edit()
            ? <>
              <button onClick={updateName}>💾</button>
              <input id="set-self" type="text" />
            </>
            : <>
              <button onClick={()=>setEdit(!edit())}>✏️</button>
              {self()?.username || "unknown  user"}
            </>
        }
      </div>

      <div class="online">
        <h3>Online:</h3>
        { Object.values(users).reduce(
            (a:string[], u:UserTable):string[] => u.online ? [...a, u.username!] : a,
            []
          ).join(',\n')
          || "No Users"
        }
      </div>

      <div class="new-item">
        <h3>New-Thing:</h3>
          <button onClick={newThing}>➕</button>
          <input id="new-thing" type="text"/>
      </div>

      <div class="things">
        <h3>Things:</h3>
        <div class="thing-scroll">
          <For each={things().sort((a,b) => Number(a.id) - Number(b.id))}>
            {({ id, rVal }) => (
              <div class="thing" data-active={rVal().status}>
                <span>
                  <input
                    id={'thing-'+id} name={'thing-'+id} type="checkbox"
                    checked={rVal().status} onChange={()=>ToggleThingStatusReducer.call(rVal().thingId)}
                  />
                  {isEditing(rVal().thingId)
                    ? <input id={'thing-input'+id} type="text" value={''+rVal().content}/>
                    : <label for={'thing-'+id}>{rVal().content || id.toString()}</label>
                  }
                </span>

                <span>
                  {isEditing(rVal().thingId)
                    ? <button onClick={()=>saveEditThing(rVal().thingId)}>💾</button>
                    : <button onClick={()=>onEditThing(rVal().thingId)} >✏️</button>
                  }
                  <button onClick={()=>DeleteThingReducer.call(rVal().thingId)}>❌</button>
                </span>
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  )
}

render(() => <App />, document.getElementById("root")!)
