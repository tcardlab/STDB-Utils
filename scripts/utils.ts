import child_process from "node:child_process";
import fs from "node:fs";
import path from "path";

import { createRequire } from "module";
const require = createRequire(import.meta.url);

// If file is moved this will have to be updated...
const ROOT_DIR = path.join(process.argv[1]!, '..', '..')
const cwd = process.cwd();

let npmCmd = process.env['npm_lifecycle_event']


