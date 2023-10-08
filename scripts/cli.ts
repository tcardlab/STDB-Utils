import child_process from "node:child_process";
import fs from "node:fs";
import path from "path";

import { createRequire } from "module";
const require = createRequire(import.meta.url);



/***   Global Vars   ***/
const ROOT_DIR = path.join(process.argv[1]!, '..', '..')
const cwd = process.cwd();
let npmCmd = process.env['npm_lifecycle_event']



/***   Helpers   ***/
let catchBadCMD = (cmd:string|undefined, cmdKeys: string[]) =>{
  if (!cmd) throw new Error(`Must specify command`)
  if (!cmdKeys.includes(cmd)) throw new Error(`unrecognized command \'${cmd}\``)
}

let catchBadDir = (pkg_dir:string|undefined) =>{
  if (!pkg_dir) throw new Error(`Must specify package (eg. \`npm run ${npmCmd} vanilla/hmr\`)`)
  if (!fs.existsSync(pkg_dir!)) throw new Error(`Directory not found at \`${pkg_dir}\`. Must specify valid package directory (eg. \`npm run ${npmCmd} vanilla/hmr\` )`)
}

let parseArgs = (cmdKeys:string[])=> {
  var pkg_path:string, cmd:string|undefined, args:string[];
  if (ROOT_DIR === cwd) {
    console.log(`called from root`)
    var [cmd, ...args] = process.argv.slice(2);
    let pkg_dir = args.shift()
    catchBadCMD(cmd, cmdKeys)
    catchBadDir(pkg_dir)
    pkg_path = path.join(ROOT_DIR, pkg_dir!)
  }
  else {
    console.log("called from package: ", path.relative(ROOT_DIR, cwd))
    var [cmd, ...args] = process.argv.slice(2); 
    catchBadCMD(cmd, cmdKeys)
    pkg_path = cwd
  }

  return { cmd:cmd!, pkg_path, args }
}

function syncMKDir(path:string) {
  try {
    // Check if the directory already exists
    if (!fs.existsSync(path)) {
      // If not, create the directory synchronously
      fs.mkdirSync(path);
      console.log(`Directory created: ${path}`);
    } else {
      // console.log(`Directory already exists: ${path}`);
    }
  } catch (err) {
    // Handle errors, such as permission issues
    console.error(`Error creating directory: ${path}\n${err}`);
  }
}


type MayPromise<T> = (Promise<T> | T);

type CMD = ({cmd, args, name}:{
  cmd:string, args:string[], name:string, 
  config:any, pkg_path:string, rootPkg:any
})=> MayPromise<([string[], ()=>void] | [string[]])>

let cmdArgs: Record<string,CMD> = {
  publish({cmd, args, name, config, pkg_path}) {
    // PS: npm run publish -- -c

    // use local package server if defined or default to root server
    let server = `--project-path ${config?.server ? path.join(pkg_path, config.server) : path.join(ROOT_DIR, `server`) }`
    let argArr = [cmd, server, ...args, name];
    let cb = ()=>{
      try {
        let ls = child_process.exec(`spacetime dns lookup ${name}`)
        ls.stdout?.on('data', (address) => {
          console.info(`Dashboard Link: https://spacetimedb.com/dashboard/${address}`)
        });
      } catch (err) {}
    }

    let res:Promise<[string[], ()=>void]> = new Promise(resolve => {
      // Wait for server to set up in parallel execution
      setTimeout(() => resolve([argArr, cb]), 1e3);
    })

    return res
  },

  logs({cmd, args, name}) {
    let argArr = [cmd, name, ...args]
    return [argArr]
  },

  sql({cmd, args, name}) {
    // PS: npm run sql \`"SELECT username FROM UserComp\`"  
    // PS: npm run sql --% \"SELECT username FROM UserComp\"
    let argArr = [cmd, name, ...args];
    return [argArr]
  },

  setHost({config, rootPkg}) {
    // perhaps it makes more sense to use .env for this. idk
    let protocol = config?.protocol || rootPkg?.config?.protocol || 'https'
    let host = config?.host || rootPkg?.config?.host || 'testnet.spacetimedb.com'
    return [["server set", `${protocol}://${host}`]]
  },

  start({config, rootPkg, args}) {
    let host = config?.host || rootPkg?.config?.host
    return [["start", `-l ${host}`, ...args]]
  },

  gen({config, pkg_path, args}) {
    // determine whether we are generating locally or to root
    let hasLocalServer = !!(config?.server)
    let base = hasLocalServer ? pkg_path : ROOT_DIR;

    let serverDir = path.join(base, 'server')
    let moduleDir = path.join(base, 'module_bindings')
    syncMKDir(moduleDir)

    // Gen single file export on completion
    let cb = ()=>{
      child_process.spawn("tsx", ['scripts/singleFileGen.ts', moduleDir], {
        stdio: "inherit",
        shell: true,
        cwd: ROOT_DIR
      })
    }
    
    return [
      ["generate", '--lang typescript', `--out-dir ${ moduleDir }`, `--project-path ${ serverDir }`, ...args], 
      cb
    ]
  },
}



/***   MAIN   ***/

async function main () {

  // Generate Keys (to ensure given cmd exists)
  let cmdKeys = Object.keys(cmdArgs)

  // Get valid args
  let {cmd, pkg_path, args} = parseArgs(cmdKeys)

  // Get Server Name et al.
  let pkgJson = path.join(pkg_path, 'package.json')
  if ( !fs.existsSync(pkgJson) ) throw new Error(`could not find \`package.json\` at path ${pkgJson}`)
  let {name, config} = require(pkgJson)

  name = config?.dbName || name  // dbName override
  // database names should not contain slashes due to tld's
  name = name.replace('/', '-')
 
  // get info from root pkg
  let rootPkg = require( path.join(ROOT_DIR, 'package.json') )

  // Order Args for given CMD
  let [argArr, cb] = await (cmdArgs[cmd]!)({cmd, args, name, config, pkg_path, rootPkg}) // already ensured cmd exists on cmdArgs 

  // Group Log info
  let logExe = ()=>{
    console.log('pkg:', name)
    console.log('cmd:', cmd)
    console.log('args:', argArr.join(" "), "\n") // args.join(" "), "\n")
  }
  

  // EXECUTE
  logExe()
  try {
    let ls = child_process.spawn("spacetime", argArr, {
      stdio: "inherit",
      shell: true
    })
    ls.on('close', (code) => { if (code ===0 && cb) cb() }); 
  } catch(err) {
    console.error(err)
  }
}

main()
