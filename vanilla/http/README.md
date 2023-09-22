## @STDB-Utils/Http

HTTP Client to send request to the SpacetimeDB services.

> NOTE: Should make this a class

```ts
!(async ()=>{
  let name = 'cursor2'
  let host = 'testnet.spacetimedb.com'
  let STDB = await client(host, name)

  let dns = await STDB.database.dns(name)
  console.log('DNS: ', dns)

  let create = await STDB.database.call('create_user', ['user_'+Date.now()])
  console.log('Call Res: ', create)

  let sqlQuery = await STDB.database.sql('SELECT username FROM UserComp')
  console.log('SQL Res: ', sqlQuery?.[0].rows.map(v=>v[0]['0']))

  let info = await STDB.database.info()
  console.log('Info Res: ', info)

  let schema = await STDB.database.schema()
  console.log('Schema Res: ', schema)
})()
```