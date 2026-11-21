import { spawnSync, execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const app = resolve(root, 'apps/suppclarity');
const args = process.argv.slice(2);
const value = key => { const n=args.indexOf(key); return n<0 ? null : args[n+1]; };
const ios=value('--ios'), android=value('--android');
if (!ios && !android) throw new Error('Choose a dedicated iOS QA simulator with --ios UUID and/or an Android emulator with --android emulator-5554. Physical devices are refused because these flows clear test data.');
if (ios) {
  const list=JSON.parse(execFileSync('xcrun',['simctl','list','devices','--json'],{encoding:'utf8'}));
  const device=Object.values(list.devices).flat().find(d=>d.udid===ios);
  if (!device || device.name!=='SuppClarity QA' || device.state!=='Booted') throw new Error('iOS tests require a booted simulator named SuppClarity QA. They clear its test keychain.');
}
if (android && !/^emulator-\d+$/.test(android)) throw new Error('Android tests accept emulator IDs only.');
const out=resolve(process.env.SUPPCLARITY_QA_OUTPUT || resolve(root,'../build-review/native-qa-v06'));
const maestro=process.env.MAESTRO_BIN || 'maestro';
mkdirSync(out,{recursive:true});
const results=[];
for(const [platform,device] of [['ios',ios],['android',android]]) {
  if(!device) continue;
  const directory=resolve(out,platform);
  mkdirSync(directory,{recursive:true});
  const run=spawnSync(maestro,['--device',device,'test','--format','JUNIT','--output',resolve(directory,'results.xml'),'--debug-output',resolve(directory,'debug'),'--test-output-dir',resolve(directory,'artifacts'),resolve(app,'maestro')],{cwd:app,encoding:'utf8',env:{...process.env,MAESTRO_CLI_NO_ANALYTICS:'true',MAESTRO_CLI_ANALYSIS_NOTIFICATION_DISABLED:'true'},timeout:15*60*1000,maxBuffer:8*1024*1024});
  writeFileSync(resolve(directory,'run.log'),(run.stdout||'')+'\n'+(run.stderr||'')+'\n'+(run.error?.message||''));
  results.push({platform,passed:run.status===0,exitCode:run.status,report:resolve(directory,'results.xml')});
  console.log(`${platform}: ${run.status===0?'passed':'failed — see '+resolve(directory,'run.log')}`);
}
writeFileSync(resolve(out,'summary.json'),JSON.stringify({checkedAt:new Date().toISOString(),physicalCameraVerified:false,results},null,2)+'\n');
process.exitCode=results.every(r=>r.passed)?0:1;
