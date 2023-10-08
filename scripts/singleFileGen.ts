import fs from 'fs';
import path from 'path';

// Get the directory path from command line arguments
const directoryPath = process.argv[2];

// Check if the directory path is provided
if (!directoryPath) {
  console.error('Please provide the directory path as a command line argument.');
  process.exit(1);
}

let exportObj:Record<string,string> = {}

try {
  // Read the contents of the directory synchronously
  const files = fs.readdirSync(directoryPath);

  // Iterate over the files
  files.forEach((file) => {
    let fileName = file.replace(/\.[tj]s/, '')

    if (fileName==="index") return // skip the file we're making

    let imprtName = fileName.split('_').reduce(
      (a, s) => a+(s[0]!).toUpperCase()+s.substring(1), ''
    )
    exportObj[imprtName] = fileName+".js"
  });

  /*
    // more rigorous as it extracts variable name from file vs hoping the file name is correct
    const pattern = /export\s+class\s+(\w+)(?:\sextends\s\w+)?/;
    files.forEach((file) => {
      const filePath = path.join(directoryPath, file);

      // Check if it's a file (not a directory)
      const stats = fs.statSync(filePath);
      if (stats.isFile()) {
        // Read the contents of the file synchronously
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          let match = content.match(pattern)
          if (match && match[1]) {
            exportObj[match[1]] = file.replace(/\.ts/, ".js")
          }
        } catch (readErr) {
          console.error('Error reading file:', readErr);
        }
      }
    });
  */
} catch (err) {
  console.error('Error reading directory:', err);
  process.exit(1);
}

let fileOut = ''
for (let [className, fileName] of Object.entries(exportObj) ) {
  fileOut += `import { ${className} } from "./${fileName}"\n`
}
fileOut += '\n\n'
fileOut += `export {\n  ${Object.keys(exportObj).join(',\n  ')}\n}`

let mod_export_path = path.join(directoryPath, 'index.ts')
fs.writeFileSync(mod_export_path, fileOut, 'utf-8');
console.log(`Generated Single File Export for ${directoryPath}`)