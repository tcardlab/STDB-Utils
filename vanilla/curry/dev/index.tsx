import styles from './App.module.css';

import {SpacetimeDBClient, Identity} from '@clockworklabs/spacetimedb-sdk'

// should prob remove this to make it more vanilla
import {createMemo, onMount} from 'solid-js'
import {createStore} from 'solid-js/store'

/* Not sure what to do about this yet... */
import CreateUserReducer from '~/module_bindings/create_user_reducer'
import SetNameReducer from '~/module_bindings/set_name_reducer'
import UserComp from '~/module_bindings/user_comp'

import { curryChange } from '../src/index.js';

/**  Create your SpacetimeDB client  **/
let token = localStorage.getItem('auth_token') || undefined;
let client = new SpacetimeDBClient("wss://testnet.spacetimedb.com", "cursor2", token);

const App = () => {
  const [userStore, setUserStore] = createStore<UserComp|{}>({})
  const isLogin = createMemo(()=>{
    return 'online' in userStore && userStore?.online
  })

  let [online, setOnline] = createStore<Record<string, UserComp>>({})
  let onChangeUser = curryChange(UserComp)
  onChangeUser((e, v, vOld)=>{
    if (!v) return

    let ID = v.identity.toHexString()
    if (e==='-' || !v?.online) return setOnline(ID, undefined!)
    setOnline(ID, v)
  }, ['+'])


/**  onConnect Callback  **/
  let local_identity: Identity | undefined = undefined;
  client.onConnect((token, identity) => {
      console.log("Connected to SpacetimeDB");
      local_identity = identity;
      localStorage.setItem('auth_token', token);
      client.subscribe([ "SELECT * FROM UserComp" ])
  })
  onMount(()=>client.connect())


/**  Connecting to the module  **/
  client.on("initialStateSync", () => {
    let user = UserComp.filterByIdentity( local_identity! );
    if (user) setUserStore(user)
  });


/**  Set Name  **/
  SetNameReducer.on((reducerEvent, reducerArgs) => {
    if (local_identity && reducerEvent.callerIdentity.isEqual(local_identity)) {
      if (reducerEvent.status === 'failed') {
        console.log((`Error setting name: ${reducerEvent.message} `))
      }
      else if (reducerEvent.status === 'committed') {
        setUserStore({...userStore, username: reducerArgs[0]});
      }
    }
  })

  CreateUserReducer.on((reducerEvent, reducerArgs) => {
    if (local_identity && reducerEvent.callerIdentity.isEqual(local_identity)) {
      if (reducerEvent.status === 'failed') {
        console.log((`Error creating user: ${reducerEvent.message} `))
      }
      else if (reducerEvent.status === 'committed') {
        let user = UserComp.filterByIdentity( local_identity! );
        if (user) setUserStore(user)
      }
    }
  })

  let nameInput:  HTMLInputElement | undefined;
  const updateName = () => {
    if (!nameInput) return 
    
    SetNameReducer.call(nameInput.value)
    nameInput.value=''
  }
  const createUser = () => {
    if (!nameInput) return

    CreateUserReducer.call(nameInput.value)
    nameInput.value=''
  }

  return (
    <div class={styles.App}>
      <p>{'username' in userStore ? `Name: ${userStore?.username}` : "Login:" }</p>
      <br/>
      <input type='text' ref={nameInput!} />
      {
        isLogin()
          ? <button onClick={updateName}>Update Name</button>
          : <button onClick={createUser}>Create User</button>
      }
      <div>
        Online: {Object.values(online).map(u=>u.username).join(', ')}
      </div>
    </div>
  )
}

export default App;
