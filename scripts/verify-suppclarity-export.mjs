import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fingerprint } from './suppclarity-fingerprint.mjs';
const base=resolve('public/suppclarity');
const manifest=JSON.parse(readFileSync(resolve(base,'source-manifest.json'),'utf8'));
if(manifest.sourceSha256!==fingerprint())throw new Error('SuppClarity source changed: run npm run build:app and commit the new export.');
const html=readFileSync(resolve(base,'index.html'),'utf8');
for(const match of html.matchAll(/(?:src|href)="(\/suppclarity\/[^\"]+)"/g)){const path=match[1].slice('/suppclarity/'.length);if(!existsSync(resolve(base,path)))throw new Error(`Missing exported asset: ${path}`);}
if(!existsSync(resolve(base,'assets/node_modules/@expo-google-fonts/manrope/400Regular')))throw new Error('Missing exported reading font.');
console.log('SuppClarity export matches the source and its entry assets exist.');
