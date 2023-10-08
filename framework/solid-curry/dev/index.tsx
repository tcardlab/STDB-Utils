import { solidCurryChange } from "../src/index.js"
import type { onChangeCB } from "../src/index.js"

import { name, config } from "../package.json"
import root_json from "~/package.json"
let pkg_config = { ...root_json.config, ...config }

////

import { render } from "solid-js/web"
import { onMount, createSignal, For, Accessor, Setter } from "solid-js"
import { createStore } from "solid-js/store"

import { SpacetimeDBClient, Identity } from '@clockworklabs/spacetimedb-sdk'

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
console.log(pkg_config.host, name)
let client = new SpacetimeDBClient(pkg_config.host, name.replace('/','-'), token);


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
  let onChangeUser = solidCurryChange(UserTable)

  let [users, setUsers] = createStore<Record<string, UserTable>>({})
  let [self, setSelf] = createSignal<UserTable|null>()
  // Upsert example
  let upsert:onChangeCB = (e, row, oldRow, red) => {
    if (!row) return 
    console.log(e, row, oldRow)
    let ID = (row || oldRow)?.identity.toHexString()
    setUsers(ID, row)
    if (ID === local_id?.toHexString()) setSelf(row)
  }
  onChangeUser(upsert, ['+'])

  // Example of handling 4 states with 1 function
  let [online, setOnline] = createStore<Record<string, UserTable>>({})
  let filterOnline:onChangeCB = (e, v, oldV)=>{
    let ID = (v||oldV)?.identity.toHexString()
    // delete or update w/ falsy online 
    if (e==='-' || !v?.online) return setOnline(ID, undefined!)
    // insert & update w/ truthy online 
    setOnline(ID, v)
  }
  onChangeUser(filterOnline, ['+'])


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
  // Using Switch Statement
  let handelThings:onChangeCB = (e, row, oldRow, red) => {
    let id = (row||oldRow)?.thingId
    switch(e) {
      case '+':
        let [rRow, setRRow] = createSignal<ThingTable>(row!)
        return setThings(v=>([...v, {id, rVal:rRow, rSet:setRRow}]))
      case '=':
        return things().find(t => t.id === id)?.rSet(row)
      case '-':
        setThings( things().filter(t => t.id !== id) )
        return rmEditThing(id)
    }
  }
  solidCurryChange(ThingTable)(handelThings, ['+'])

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
        <div>
          {/* Filters a Reactive Data Structure */}
          { Object.values(users).reduce(
              (a:string[], u:UserTable):string[] => u.online ? [...a, u.username!] : a,
              []
            ).join(',\n')
            || "No Users"
          }
        </div>
        <div>
          {/* Filters at STDB Event Level */}
          { Object.values(online).map(u => u.username).join(',\n') }
        </div>
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
