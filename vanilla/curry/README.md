## @STDB-Utils/Curry:

There really isn't much benefit to this over hooks aside from more fine-grain control over generic Change events. However it only operates on a single table (although you can always share one callback among many functions).

You can also set the subscription array reactively for some interesting behavior.


```ts
  let [online, setOnline] = createStore<Record<string, UserComp>>({})
  let onChangeUser = curryChange(UserComp)

  onChangeUser((e, v, vOld)=>{
    if (!v) return

    let ID = v.identity.toHexString()
    if (e==='-' || !v?.online) return setOnline(ID, undefined!)
    setOnline(ID, v)
  }, ['+']) // '+' will allow initial inserts to be counted

  onChangeUser((e, v, vOld)=>{
    if (!v || !v.online) console.log(`${vOld.username} is now offline` )
  }) // listens to everything

  onChangeUser((e, v, vOld)=>{
    if (!v) console.log(`${vOld.username} is deleted` )
  }, [], ['-']) // only listens to deletions


  let [subs, setSubs] = createSinal(['+', '-'])
  onChangeUser((e, v, vOld)=>{
    if (!v) console.log(`${vOld.username} is deleted` )
  }, [], subs) // only listens to deletions + inserts
  setSubs(['=']) // change to only listen to updates
```
