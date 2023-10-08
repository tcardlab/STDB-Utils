import child_process from "node:child_process";
import path from "path";

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const ROOT_DIR = path.join(process.argv[1]!, '..', '..')
let pkgJson = path.join(ROOT_DIR, 'package.json')

const {config: {protocol, host}} = require(pkgJson);

child_process.spawn("spacetime", ["server set", `${protocol}://${host}`], {
  stdio: "inherit",
  shell: true,
  cwd: ROOT_DIR,
})
