import { fingerprint } from './suppclarity-fingerprint.mjs';
import { cpSync, mkdirSync, rmSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
const app=resolve('apps/suppclarity');
execFileSync(process.execPath,[resolve(app,'node_modules/expo/bin/cli'),'export','--platform','web'],{cwd:app,stdio:'inherit',env:{...process.env,SUPPCLARITY_WEB_BASE_PATH:'/suppclarity'}});
const destination=resolve('public/suppclarity');
rmSync(destination,{recursive:true,force:true});
mkdirSync(destination,{recursive:true});
cpSync(resolve(app,'dist'),destination,{recursive:true});
if(!existsSync(resolve(destination,'index.html')))throw new Error('Missing Expo web export');
// SPA export uses the Academy subpath for router links and static assets.
const index=resolve(destination,'index.html');
let html=readFileSync(index,'utf8');
html=html.replace('<title>SuppClarity</title>','<title>SuppClarity — Supplement Education</title>');
writeFileSync(index,html);

writeFileSync(resolve(destination,'source-manifest.json'),JSON.stringify({sourceSha256:fingerprint(app),webBasePath:'/suppclarity'},null,2)+'\n');

mkdirSync(resolve(destination,'licenses'),{recursive:true});
cpSync(resolve(app,'node_modules/@expo-google-fonts/manrope/LICENSE_FONT'),resolve(destination,'licenses/Manrope-OFL.txt'));
