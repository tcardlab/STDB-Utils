let HMRData = import.meta.hot?.data
let token = HMRData?.token || localStorage.getItem('auth_token') || undefined;
let client:I<typeof SpacetimeDBClient> = HMRData?.client || new SpacetimeDBClient("wss://testnet.spacetimedb.com", "dbname", token);
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

// need to group, functionalize and export