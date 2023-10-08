import child_process from "node:child_process";
import fs from "node:fs";
import path from "path";

import { createRequire } from "module";
const require = createRequire(import.meta.url);

// If file is moved this will have to be updated...
const ROOT_DIR = path.join(process.argv[1]!, '..', '..')
const cwd = process.cwd();

// Resolve Package Directory
let pkg_path;
if (ROOT_DIR === cwd) {
  console.log("called from root")
  const [pkg_dir] = process.argv.slice(2);
  if (!pkg_dir) throw new Error("Must specify package (eg. `npm run dev vanilla/hmr` )")

  pkg_path = path.join(ROOT_DIR, pkg_dir)
} else {
  console.log("called from package")
  pkg_path = cwd
}

// Resolve Vite Type and Dev-Script Path 
let pkgJson = path.join(pkg_path, 'package.json')
if ( !fs.existsSync(pkgJson) ) throw new Error(`could not find \`package.json\` at path ${pkgJson}`)

let {config: {vite: vite_type}} = require(pkgJson)
console.log('vite config:', vite_type)

let src_script_path = path.join(pkg_path, 'src', 'index')

// Run vite server
const relative_pkg_path = path.relative(ROOT_DIR, src_script_path);
console.log('pkg path:', relative_pkg_path)

child_process.spawn("vite", ["build", `--config scripts/${vite_type}.config.js`], {
  stdio: "inherit",
  shell: true,
  cwd: ROOT_DIR,
  env: {...process.env, pkg_path: pkg_path, script_path: src_script_path}
})


/*
  an alternative approach might be to import the config/plugins 
  and call the server directly from this file: 
  https://vitejs.dev/guide/api-javascript.html#createserver
  import { build, createServer } from 'vite';
*/
