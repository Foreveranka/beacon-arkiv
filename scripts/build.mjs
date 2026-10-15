import {build} from 'esbuild';import{cp,mkdir,readFile,writeFile}from'node:fs/promises';
await mkdir('dist',{recursive:true});await cp('public','dist',{recursive:true});
await build({entryPoints:['src/app.mjs'],bundle:true,format:'esm',target:'es2022',minify:true,outfile:'dist/app.js'});
for(const route of ['app','docs']){await mkdir(`dist/${route}`,{recursive:true});await cp('public/index.html',`dist/${route}/index.html`);}
await mkdir('dist/arkiv',{recursive:true});await cp('arkiv','dist/arkiv',{recursive:true});
console.log('Beacon static build complete');
