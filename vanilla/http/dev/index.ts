
!(async ()=>{
  let name = 'cursor2'
  let host = 'testnet.spacetimedb.com'
  let STDB = await client(host, name)

  let dns = await (STDB.database.dns!)(name)
  console.log('DNS: ', dns)

  if (!dns?.Success?.address) return
  let nameLookup = await STDB.database.reverse_dns?.(dns.Success.address)
  console.log('NameLookup: ', nameLookup)

  let ping = await STDB.database.ping?.()
  console.log('Ping Res: ', [404, 200].includes(ping?.status||0))

  let call = await STDB.database.call?.('set_name', ['user_'+Date.now()])
  console.log('Call Res: ', call)

  let create = await STDB.database.call?.('create_user', ['user_'+Date.now()])
  console.log('Call Res: ', create)

  // hmm, not working atm... 400
  //let logs = await STDB.database.logs?.()
  //console.log('Call Res: ', logs)

  let sqlQuery = await STDB.database.sql?.('SELECT username FROM UserComp')
  console.log('SQL Res: ', sqlQuery?.[0].rows.map(v=>v[0]['0']))

  let info = await STDB.database.info?.()
  console.log('Info Res: ', info)

  let schema = await STDB.database.schema?.()
  console.log('Schema Res: ', schema)

  let schemaEntity = await STDB.database.schema?.('table', 'UserComp')
  console.log('SchemaEntity Res: ', schemaEntity)
})()
