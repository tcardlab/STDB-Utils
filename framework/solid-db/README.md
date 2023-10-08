### @STDB-Utils/Solid-DB

Provides deeply reactive tables by hijacking the `Table.insert()`, `Table.update()`, and `Table.delete()` (which usually then call the `Table.onXYZ` form). We now have the ability to utilize derived signals and memos on deep values to reduce the amount of filters and rerenders per update.

You have the option to run this Solid.js manged cache in addition to the SpacetimeDB cache, but that will effectively double the memory usage of each `Table`. This potentially useful for migrating on or off. You can select individual `Tables` by name in an array or set dualDB to `true` to run both instances on all `Tables`.



```ts
import { address, host } from "../package.json"
import { Comp, solidifySTDB } from "../src/index.js"
import { SpacetimeDBClient } from '@clockworklabs/spacetimedb-sdk';

let token = localStorage.getItem('auth_token') || undefined;
let client = new SpacetimeDBClient(host, address, token);

// Wrap all tables to use our cache system
solidifySTDB(client as I<typeof SpacetimeDBClient>)

// We access our cache through a new property `.solidDB`
interface Super extends Table { solidDB?: Comp }

const App = () => {
  // reduce the amount of `.solidDB1's we'd have to call and assign type
  let UserDB:Comp = (userComp as I<Super>).solidDB;

/** Not super relevant **/
  let [ID, setID] = createSignal<undefined|string>(undefined)
  client.onConnect((token, identity) => {
    setID(identity.toHexString())
  })
  onMount( ()=>hmrConnect() )


/**  Register Self  **/
  // A signal that triggers downstream updates on change:
  const self = createMemo(()=>UserDB.filterKV('identity', ID())[0]) 
  // Derived signal that updates when `self` does
  const isLogin = ()=>self()?.get('online') || false;

  // derived signal that run on updates
  let online = ()=>UserDB.filterKV('online', true)
  

/**  We still have old events too  **/
  // You can choose to use the old `Table.onUpdate()` methods too
  // (I might make hooks out of these later)
  UserDB.on('solid-update', (user, oldUser, red) => {
    let [newName, oldName] = [user.get('username'), oldUser.get('username')]

    if (!oldName) return console.log(`New User ${newName} joined.`);
    if (newName !== oldName) return console.log(`User ${oldName} renamed to ${newName}.`);
  })
  
  UserDB.on('solid-insert', (user, oldUser, red) => {
    if (!reducerEvent) return // ignore client population inserts
    console.log(`New User ${user.get('username')} created.`);
  })

  //Hook under consideration:
  solidInsert( (user, oldUser, red) => {
    if (!reducerEvent) return // ignore client population inserts
    console.log(`New User ${user.get('username')} created.`);
  }, [UserDB])
  // good for coordinating shared logic

  return (
    {/* Everything here will automatically update on relevant changes */}
    <div class={styles.App}>
      <p>name: {self() ? self().get('username') : "unknown" }</p>
      <br/>
      {
        isLogin()
          ? <button>Update Name</button>
          : <button>Create User</button>
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
```

might also be beneficial to insert my own uuid on rows that persists updates. 