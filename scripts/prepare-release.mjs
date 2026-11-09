import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const {version}=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
if(!/^[0-9]+\.[0-9]+\.[0-9]+$/.test(version))throw Error('Expected a semantic release version');
function modules(dir){return fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name)).flatMap(entry=>{
 const full=path.join(dir,entry.name);return entry.isDirectory()?modules(full):entry.name.endsWith('.js')?[path.relative(root,full).split(path.sep).join('/')]:[];
});}
const imports=Object.fromEntries(modules(path.join(root,'js')).map(file=>[`./${file}`,`./${file}?v=${version}`]));
const map=`<!-- release-imports:start -->\n  <script type="importmap">${JSON.stringify({imports})}</script>\n  <!-- release-imports:end -->`;
const file=path.join(root,'index.html');let html=fs.readFileSync(file,'utf8');
html=html.replace(/\s*<!-- release-imports:start -->[\s\S]*?<!-- release-imports:end -->\s*/,'\n  ');
html=html.replace(/<script type="module" src="js\/main\.js(?:\?[^\"]*)?"><\/script>/,`${map}\n  <script type="module" src="js/main.js?v=${version}"></script>`);
html=html.replace(/(<link rel="stylesheet" href=")([^"?]+)(?:\?[^\"]*)?(">)/g,`$1$2?v=${version}$3`);
fs.writeFileSync(file,html);
console.log(`Prepared ${version}: ${Object.keys(imports).length} versioned ES modules and stylesheet URLs.`);
