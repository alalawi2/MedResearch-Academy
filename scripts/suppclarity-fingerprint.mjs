import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
export function fingerprint(appDirectory=resolve('apps/suppclarity')) {
  const files=['package.json','package-lock.json','app.json','app.config.ts'];
  function walk(directory){for(const item of readdirSync(resolve(appDirectory,directory),{withFileTypes:true})){const path=`${directory}/${item.name}`;if(item.isDirectory())walk(path);else files.push(path);}}
  walk('src');walk('assets');
  const hash=createHash('sha256');
  for(const file of files.sort()){hash.update(file);hash.update('\0');hash.update(readFileSync(resolve(appDirectory,file)));hash.update('\0');}
  return hash.digest('hex');
}
