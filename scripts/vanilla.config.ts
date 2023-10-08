import { defineConfig, build, createServer } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import {join} from 'path';
import dts from 'vite-plugin-dts'
import pkg_script_loader from "./pkg_script_loader.js"
import { createRequire } from "module";
const require = createRequire(import.meta.url);


let pkg_path = process.env.pkg_path!
let script_path = process.env.script_path!
let pkg_json = require(join(pkg_path, 'package.json'))


export default defineConfig({
  plugins: [
    pkg_script_loader({name: pkg_json.name, path: script_path}),
    solidPlugin(),
    dts({  
      //copyDtsFiles: true,
      //rollupTypes: true,
      insertTypesEntry: true, 
      //entryRoot: pkg_path, //join(pkg_path, 'dist'), //pkg_path,
      //strictOutput: false,
      root: pkg_path, // "./",
      //tsconfigPath: '../../tsconfig.json', //join(pkg_path, 'tsconfig.json')
    })
  ],
  server: {
    port: 3000
  },
  build: {
    target: 'esnext',
    outDir: join(pkg_path, 'dist'),
    lib: {
      entry: join(pkg_path, 'src', 'index.ts'),
      name: 'default',
      fileName: 'index',
    },
    rollupOptions: {
      external: ['@clockworklabs/spacetimedb-sdk'],
      output: {
        globals: {
          '@clockworklabs/spacetimedb-sdk': '@clockworklabs/spacetimedb-sdk'
        }
      }
    },
    // Define build overrides via package.json (eg {"minify": false})
    ... (pkg_json?.build || {}) // or we could add a config file to pkg dir to override
  },
  resolve: {
    alias: [
      { find: '~', replacement: join(__dirname, '..') }
    ]
  }
})
