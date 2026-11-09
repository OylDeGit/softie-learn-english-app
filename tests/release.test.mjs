import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=new URL('../',import.meta.url);
test('the published HTML versions the entire ES module graph and every stylesheet',()=>{
 const {version}=JSON.parse(fs.readFileSync(new URL('package.json',root),'utf8'));
 const html=fs.readFileSync(new URL('index.html',root),'utf8');
 const {imports}=JSON.parse(html.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]);
 const js=fs.readdirSync(new URL('js/',root),{recursive:true}).filter(name=>name.endsWith('.js'));
 for(const file of js){const key='./js/'+file.split(path.sep).join('/');assert.equal(imports[key],`${key}?v=${version}`);}
 assert.ok(html.includes(`src="js/main.js?v=${version}"`));
 for(const [,href]of html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g))assert.ok(href.endsWith(`?v=${version}`));
 assert.ok(html.indexOf('type="importmap"')<html.indexOf('type="module"'));
});
