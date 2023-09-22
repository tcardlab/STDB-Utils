import styles from './App.module.css';
import { solidTable } from './utils/solidTable'
import { __SPACETIMEDB__ } from '@clockworklabs/spacetimedb-sdk';

let HMRData = import.meta.hot?.data
let token = HMRData?.token || localStorage.getItem('auth_token') || undefined;
let client:I<typeof SpacetimeDBClient> = HMRData?.client || new SpacetimeDBClient("wss://testnet.spacetimedb.com", "cursor2", token);
HMRData.client = client
HMRData.token = token

import.meta.hot?.on?.('vite:beforeUpdate', ()=>{
  client.db.tables.forEach(table=>{
    table.emitter.removeAllListeners()
  })
  //"update" | "insert" | "delete" | "initialStateSync" | "connected" | "disconnected" | "client_error";
  client.emitter.removeAllListeners()
})

function hmrConnect() {
  if (!client.live) return client.connect()
  client.emitter.emit("connected", client.token, client.identity)
}

const App = () => {
  const [userStore, setUserStore] = createStore<I<typeof UserComp>|{}>({})
  const isLogin = createMemo(()=>{
    return 'online' in userStore && userStore?.online
  })

  let mapTest = tableMap(UserComp) 
  client.on("initialStateSync", () => {
    console.log('Map:', mapTest)
  });

  let [userComp$, delUserComp$] = solidTable(userComp);

  // Demo: Sub after Init 
  // Note: filter mostly does this for you anyway
  let [online, setOnline] = createStore<Record<string, I<typeof UserComp>>>({})

  let onChangeUser = curryChange(UserComp)
  onChangeUser((e, v, vOld)=>{
    let ID:string = (v||vOld!).identity.toHexString()
    if (e==='-' || !v?.online) return setOnline(ID, undefined!)
    setOnline(ID, v)
  })
  
  client.on("initialStateSync", () => {
    let onlineUsers = UserComp.filterByOnline(true);
    let initV = onlineUsers.reduce((a, u)=>({...a, [u.identity.toHexString()]:u}), {})
    setOnline(initV)
  })


/**  onConnect Callback  **/
  let local_identity: Identity | undefined = undefined;
  client.onConnect((token, identity) => {
      console.log("Connected to SpacetimeDB");
    
      local_identity = identity;

      localStorage.setItem('auth_token', token);

      client.subscribe([
        "SELECT * FROM UserComp",
      ])
  })
  onMount(()=>{
    hmrConnect()
  })


/**  Connecting to the module  **/
  client.on("initialStateSync", () => {
    let user = UserComp.filterByIdentity( local_identity! );
    if (user) setUserStore(user)
    console.log('userStore:', userStore)
  });

  
/**  User.onUpdate callback - Notify about updated users  **/
  onUpdate((user, oldUser) => {
    if (!oldUser?.username) {
      console.log(`New User ${user.username} joined.`);
    }
  
    if (user?.username !== oldUser?.username) {
      console.log(`User ${oldUser?.username} renamed to ${user?.username}.`);
    }
  }, [UserComp])

  UserComp.onInsert((user, reducerEvent) => {
    if (!reducerEvent) return // ignore client population inserts
    console.log(`New User ${user.username} created.`);
  })


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
    if (nameInput) SetNameReducer.call(nameInput.value);
  }
  const createUser = () => {
    if (nameInput) CreateUserReducer.call(nameInput.value)
  }

  return (
    <div class={styles.App}>
      <p>name: {'username' in userStore ? userStore?.username : "unknown" }</p>
      <br/>
      <input type='text' ref={nameInput!} />
      {
        isLogin()
          ? <button onClick={updateName}>Update Name</button>
          : <button onClick={createUser}>Create User</button>
      }
      <div>
        Online: {Object.values(online).map(u=>u.username).join(', ')}
        <br/>
        Users: { userComp$.values().map(u=>u.username).join(', ') }
      </div>
    </div>
  )
}

export default App;
