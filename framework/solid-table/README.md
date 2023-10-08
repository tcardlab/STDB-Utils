## @STDB-Utils/Solid-Table

Provides a shallow reactive watcher to a table.

Could also iterate over all the Tables registered under client,
rather than manually wrapping individually.

```js
// Import Table
import UserComp from '~/module_bindings/user_comp'

const App = () => {
  // Shallow Reactive Wrapper
  let [userComp$, delUserComp$] = solidTable(userComp);

  return (
  <div class={styles.App}>
    <div>
      {/* When the DB row changes, this auto updates */}
      Users: { '' + userComp$.values().map(u=>u.username) }
    </div>
  </div>
  )
}
```

might also be beneficial to insert my own uuid on rows that persists updates.