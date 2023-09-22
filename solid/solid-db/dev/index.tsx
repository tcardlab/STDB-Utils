import styles from './App.module.css';
import { name, /* host */ } from "../package.json"
import { Comp, solidifySTDB } from "../src/index.js"
import { createMemo, createSignal } from 'solid-js'
import { __SPACETIMEDB__, SpacetimeDBClient } from '@clockworklabs/spacetimedb-sdk';

let HMRData = import.meta.hot?.data
let token = HMRData?.token || localStorage.getItem('auth_token') || undefined;
let client:I<typeof SpacetimeDBClient> = HMRData?.client || new SpacetimeDBClient("wss://testnet.spacetimedb.com", name, token);
HMRData.client = client
HMRData.token = token

import.meta.hot?.on?.('vite:beforeUpdate', ()=>{
  client.db.tables.forEach(table=>{
    table.emitter.removeAllListeners()
  })
  client.emitter.removeAllListeners()
})

import.meta.hot?.on?.('vite:beforeUpdate', ()=>{
  for (let [name, table] of __SPACETIMEDB__.clientDB.tables) {
    table.emitter.removeAllListeners()
  }
})

function hmrConnect() {
  if (!client.live) return client.connect()
  client.emitter.emit("connected", client.token, client.identity)
}

solidifySTDB(client)


interface Super extends Table {
  solidDB?: Comp
}

const App = () => {
  let UserDB:Comp = (userComp as I<Super>).solidDB;

/**  onConnect Callback  **/
  let [ID, setID] = createSignal<undefined|string>(undefined)
  client.onConnect((token, identity) => {
      console.log("Connected to SpacetimeDB");
      localStorage.setItem('auth_token', token);

      client.subscribe([ "SELECT * FROM UserComp" ])
      setID(identity.toHexString())
  })
  onMount(()=> hmrConnect() )


/**  Register Self  **/
  const self = createMemo(() => {
    let filtered = UserDB.filterKV('identity', ID())
    return filtered[0]
  })

  const isLogin = ()=>self()?.get('online') || false;
  let online = ()=>UserDB.filterKV('online', true)

  
/**  User.onUpdate callback - Notify about updated users  **/
  UserDB.on('solid-update', (user, oldUser)=> {
    let [newName, oldName] = [user.get('username'), oldUser.get('username')]

    if (!oldName) return console.log(`New User ${newName} joined.`);
    if (newName !== oldName) return console.log(`User ${oldName} renamed to ${newName}.`);
  })
  

  UserDB.on('solid-insert', (user, reducerEvent) => {
    if (!reducerEvent) return // ignore client population inserts
    console.log(`New User ${user.get('username')} created.`);
  })


/**  Set Name  **/
  let nameInput:  HTMLInputElement | undefined;
  const updateName = () => {
    if (!nameInput) return
    SetNameReducer.call(nameInput.value)
    nameInput.value = ''
  }
  const createUser = () => {
    if (!nameInput) return
    CreateUserReducer.call(nameInput.value)
    nameInput.value = ''
  }


/**  Error Handling  **/
  SetNameReducer.on((reducerEvent, reducerArgs) => {
    if (reducerEvent.callerIdentity.toHexString() === ID()) {
      if (reducerEvent.status === 'failed') {
        console.log((`Error setting name: ${reducerEvent.message} `))
      }
    }
  })

  CreateUserReducer.on((reducerEvent, reducerArgs) => {
    if (reducerEvent.callerIdentity.toHexString() === ID()) {
      if (reducerEvent.status === 'failed') {
        console.log((`Error creating user: ${reducerEvent.message} `))
      }
    }
  })



  return (
    <div class={styles.App}>
      <p>name: {self() ? self().get('username') : "unknown" }</p>
      <br/>
      <input type='text' ref={nameInput!} />
      {
        isLogin()
          ? <button onClick={updateName}>Update Name</button>
          : <button onClick={createUser}>Create User</button>
      }
      <div>
        <br/>
        Online: { ''+online().map(u=>u.get('username')) }
        <br/> <br/>
        Users: { ''+UserDB.rows().map(u=>u.get('username')) }
      </div>
    </div>
  )
}

export default App;
