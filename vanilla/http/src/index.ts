/*

  Probably convert this into classes.

  HttpClient class
    HttpDatabase class
    HttpIdentity class
    HttpEnergy class

  or something?
  good enough for now tho...
*/

interface Database {
  (): (URL);
  dns: (name:string)=>Promise<object>;
}

interface Database2 extends URL {
  dns: (name:string)=>Promise<{ "Success": {domain: string, address?: string} }>;
  reverse_dns: (name:string)=>Promise<{names: Array<string> }>;
  set_name: (domain:string, register_tld:boolean, address:string)=>Promise<{ 
    Success?: { domain: string, address: string },
    TldNotRegistered?: { domain: string }
    PermissionDenied?: { domain: string }
  }>;

  ping: ()=>Promise<Response>;

  register_tld: ({tld}:{tld:string})=>Promise<{
    Success?: { domain: string }
    AlreadyRegistered?: { domain: string }
    Unauthorized?: { domain: string } 
  }>;

  call: (reducer:string, args:any[], address?:string)=>Promise<Response>;

  schema:(
      (...args:any[]) => Promise<any>
    | ((address:string, argN?:{expand:boolean}) => Promise<any>)
    | ((address:string, entityType:string, entityName:string, argN?:{expand:boolean}) => Promise<any>)
  )

  info: (address?:string)=>Promise<{
    address: string,
    identity: string,
    host_type: "wasmer",
    num_replicas: number,
    program_bytes_address: string
  }>;

  logs:(opts?:{follow?:boolean, num_lines?:number}, address?:string)=>Promise<Response>;

  sql: (queries:string|string[], dbAddress?:string)=>Promise<{
    schema: {elements: Array<any>},
    rows: Array<any>
  }[]>;

/* 
  request_recovery_code?: ()=>Promise<Response>;
  confirm_recovery_code?: ()=>Promise<Response>;
  publish?: ()=>Promise<Response>;
  delete?: ()=>Promise<Response>;
  subscribe?: ()=>Promise<Response>; 
*/

}

let fetchJSON = async (url: URL | RequestInfo, opts?:RequestInit | undefined) => {
  let res = await fetch(url, opts)
  if (res.ok || res.body) try {
    return await res.json()
  } catch(err) {
    console.log('fetchJSON Error - ', res, err)
  }
}

let reducerFetch = async (url: URL | RequestInfo, opts?:RequestInit | undefined) => {
  let res = await fetch(url, opts)
  if (res.ok) try {
    return res.status
  } catch(err:any) {
    return err.message
  } else {
    return res.json()
  }
}

let join = (baseUrl:string|URL|(()=>URL), ...subPath:string[])=>{
  // TS complained to i had to turn 1 line into 8
  let resolvedBase:URL;
  if (baseUrl instanceof URL) {
    resolvedBase = baseUrl
  } else if (baseUrl instanceof String || typeof baseUrl === 'string') {
    resolvedBase = new URL(baseUrl as string)
  } else {
    resolvedBase = baseUrl()
  }
  return new URL( [resolvedBase.pathname, ...subPath].join('/'), resolvedBase )
}

let setParams = (paramObj:URLSearchParams, params: Record<string, string|number|boolean>) => {
  for (let [k, v] of Object.entries(params)) {
    paramObj.append(k,''+v)
  }
}

export const client = async (
  host:string,
  dbAddress:string,
  ssl: boolean=true,
  token?: null|string
) => {
  let TransferProtocol = ssl ? 'https': 'http'
  const baseURL = new URL(`${TransferProtocol}://${host}/`); 

  const headers: Record<string, string> = {};
  if (!token) {
    // Gen token in none
    let tokenUrl = `https://testnet.spacetimedb.com/identity`;
    const response = await fetch(tokenUrl, { method: "POST", headers });
    token = response.ok ? (await response.json()).token : ''
  }
  headers["Authorization"] = `Basic ${btoa("token:"+token)}`

  function setToken (token:string) {
    headers["Authorization"] = `Basic ${btoa("token:"+token)}`
  }

  function setDBAddress (address:string) {
    dbAddress = address
  }

/* Could i have dine a class instead? probably lul*/
  //let database:Database = ()=>new URL('database', baseURL);
  let database = (new URL('database', baseURL) as Database2)
  DATABASE: {
    /***   GET   ***/
    database.dns = async (name) => await fetchJSON(join(database, 'dns', name))

    database.reverse_dns = async (address) => await fetchJSON(join(database, 'reverse_dns', address))

    database.set_name = async (domain, register_tld=true, address=dbAddress) => {
      let query = join(database, 'set_name')
      setParams(query.searchParams, {address, domain, register_tld})
      return await fetchJSON(query, { headers })
    }

    database.ping = async () => {
      return await fetch(join(database, 'ping'))
    }

    database.register_tld = async ({ tld }) => {
      let query = join(database, 'register_tld')
      setParams(query.searchParams, { tld })
      return await fetchJSON(query, { headers })
    }

    database.logs = async (opts={follow:false, num_lines:50}, address=dbAddress) => {
      let url = join(database, 'logs', address)
      setParams(url.searchParams, opts||{})
      console.log(url.href)
      return await fetchJSON(url, { headers })
    }

    database.info = async (address:string=dbAddress) => await fetchJSON(join(database, 'info', address), {
      headers
    })
    
    // Not properly overloaded, but good enough for now, very tired
    // can def be simplified... maybe
    database.schema = async (...args) => {
      let url:URL;
      if (args.length === 0) {
        url = join(database, 'schema', dbAddress)
      } else if (args.length === 1) {
        let [address, opts] = typeof args?.[0] === 'object' ? [dbAddress, args?.[0]] : [args?.[0], {}]
        url = join(database, 'schema', address)
        setParams(url.searchParams, opts||{expand:false})
      } else if (args.length === 2) {
        if (typeof args[0] === 'string' && typeof args[0] === 'string'){
          let [entityType, entityName] = args
          url = join(database, 'schema', dbAddress, entityType, entityName)
          setParams(url.searchParams, {expand:false})
        } else {
          let [address, opts] = args
          url = join(database, 'schema', address)
          setParams(url.searchParams, opts||{expand:false})
        }
      } else if (args.length === 3) {
        let [entityType, entityName, opts] = args
        let address = dbAddress
        url = join(database, 'schema', address, entityType, entityName)
        setParams(url.searchParams, opts||{expand:false})
      } else {
        let [address, entityType, entityName, opts] = args
        url = join(database, 'schema', address, entityType, entityName)
        setParams(url.searchParams, opts||{expand:false})
      }
      return await fetchJSON(url)
    }


    /***   POST   ***/
    database.sql = async (queries:string|string[], address:string=dbAddress) => {
      return await fetchJSON(join(database, 'sql', address), {
        method: 'POST', headers,
        body: Array.isArray(queries) ? queries.join(';') : queries
      })
    }
    
    database.call = async (reducer:string, args:any[]=[], address:string=dbAddress) => {
      return await reducerFetch(join(database, 'call', address, reducer), {
        method: 'POST', headers, body: JSON.stringify(args)
      })
    }

    
    // request_recovery_code?: ()=>Promise<Response>;
    // confirm_recovery_code?: ()=>Promise<Response>;
    // publish?: ()=>Promise<Response>;
    // delete?: ()=>Promise<Response>;
    // subscribe?: ()=>Promise<Response>;
  }


  let identity = new URL('identity', baseURL);
  IDENTITY: {/*

    WIP

  */}


  let energy = new URL('energy', baseURL);
  ENERGY: {/*

    WIP

  */}

  return {
    database,
    identity,
    energy,
    setToken,
    setDBAddress
  }
 
}
