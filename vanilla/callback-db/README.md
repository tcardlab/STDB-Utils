## @STDB-Utils/callback-db (WIP):

hijacks the `Table.insert()`, `Table.update()`, and `Table.delete()` to add per row callback set and a getter. The getter makes it easier to retrieve a value with live data at any point without having to rely on a filter. The effect set is just another way to tightly couple logic and data.

<br/>
<table>
  <tr>
    <th>oldRowPK</th> <th> . . . column data . . . </th> <th>getter()</th> <th>[effect() Set, ...]</th>
  </tr>
  <tr>
    <td>^update^</td> <td>. . . ^update^ . . . </td> <td colspan="2">v passed to new insert v</td>
  </tr>
  <tr>
   <th>newRowPK</th> <th> . . . column data . . . </th> <th>getter()</th> <th>[effect() Set, ...]</th>
  </tr>
</table>
<br/><br/>


Pseudo code:
```js
// Import Table
import UserComp from '~/module_bindings/user_comp'

let client = new SpacetimeDBClient(host, address, token);
callbackDB(client)

const App = () => {
  let ID;
  client.onConnect((token, identity) => { ID = identity })
  onMount( ()=> hmrConnect() )

  // Preemptively set filter to get val on first insert 
  // (could run insert logic here too)
  let [self] = UserComp.once(val => val.ID === ID)
  self( v => document.getElementById("ME").innerHTML = v.username )
  // set effect: (vNew, vOld) => {} if 
  // (vOld===null) if deletion, (vNew===null) if deletion
  // will set effect on all row level updaes

  let online = UserComp.always(val => val.online) // add and drop from list
  online( v => document.getElementById("ME").innerHTML = ""+v.map(u=>u.username))
  // watch a set of rows
  
  return (
    <div class={styles.App}>
      <div >
        my name: <p id="ME">{/*Username Here */}</p>
      </div>
       <div >
       online: <p id="ONLINE">{/*Username Here */}</p>
      </div>
    </div>
  )
}
```

might also be beneficial to insert my own uuid on rows that persists updates. 