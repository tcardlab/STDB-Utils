import child_process from "node:child_process";
import fs from "node:fs";
import path from "path";

import { createRequire } from "module";
const require = createRequire(import.meta.url);

// If file is moved this will have to be updated...
const ROOT_DIR = path.join(process.argv[1]!, '..', '..')
const cwd = process.cwd();

// Resolve Package Directory
let pkg_path: string;
let dev_script: string|undefined;
let tsx_script: string|undefined;
if (ROOT_DIR === cwd) {
  console.log("called from root")
  const [pkg_dir] = process.argv.slice(2);
  if (!pkg_dir) throw new Error("Must specify package (eg. `npm run dev vanilla/hmr` )")

  pkg_path = path.join(ROOT_DIR, pkg_dir)
  dev_script = process.argv[3]
  tsx_script = process.argv[4]
} else {
  console.log("called from package");

  pkg_path = cwd
  dev_script = process.argv[2]
  tsx_script = process.argv[3]
}

// Resolve Vite Type and Dev-Script Path 
let pkgJson = path.join(pkg_path, 'package.json')
if ( !fs.existsSync(pkgJson) ) throw new Error(`could not find \`package.json\` at path ${pkgJson}`)

let {config: {vite: vite_type}} = require(pkgJson)
console.log('vite config:', vite_type)

let dev_file = dev_script ? dev_script.replace(/\.[tj]s/, '') : 'index'
let dev_script_path = path.join(pkg_path, 'dev', dev_file)

const relative_script_path = path.relative(ROOT_DIR, dev_script_path);
console.log('pkg path:', relative_script_path)


// Run script
if (tsx_script==='tsx' || !vite_type || vite_type == "none") {
  // Cuz this is often run in parallel to STDB server, we need to wait for it to init
  setTimeout(()=>{
      child_process.spawn("tsx", [relative_script_path], {
        stdio: "inherit",
        shell: true,
        cwd: ROOT_DIR,
        env: {...process.env, pkg_path: pkg_path, script_path: relative_script_path}
      })
    },
    250
  )
} 
// Run vite server
else {
  // can override vite config at script call
  child_process.spawn("vite", ["serve", `--config scripts/${vite_type || tsx_script}.config.js`], {
    stdio: "inherit",
    shell: true,
    cwd: ROOT_DIR,
    env: {...process.env, pkg_path: pkg_path, script_path: relative_script_path}
  })
}
