const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
const context={exports:{},Date};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/public-content.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,context);
const {eventStatus,isRecent}=context.exports;
for(const [date,status] of [
 ['2026-04-06T20:00:00Z','Tomorrow'],
 ['2026-04-07T20:00:00Z','Today'],
 ['2026-04-08T16:00:00Z','In progress'],
 ['2026-04-08T17:00:00Z','Past event'],
 ['2026-10-09T08:00:00Z','Past event'],
]) assert.equal(eventStatus(new Date(date)),status,date);
assert.equal(isRecent('2026-03-01',new Date('2026-10-09')),false);
assert.equal(isRecent('2026-10-10',new Date('2026-10-09')),false);
assert.equal(isRecent('invalid',new Date('2026-10-09')),false);
assert.equal(isRecent('2026-10-08',new Date('2026-10-09')),true);
const read=path=>fs.readFileSync(path,'utf8');
const burnout=read('src/pages/studies/ResidentBurnout.tsx');
assert(burnout.includes('CBI — 19 items'));
assert(!burnout.includes('first in the region'));
assert(!burnout.includes('March 2025 – March 2026'));
assert(burnout.includes('Reconnecting WHOOP does not restart'));
const layout=read('src/components/Layout.tsx');
assert(layout.includes('aria-expanded={menuOpen}'));
assert(layout.includes('to="/privacy"'));
assert(layout.includes('to="/sign-in"'));
const app=read('src/App.tsx');
assert(app.includes('path="/sign-in"'));
assert(app.includes('lazy(() => import'));
const contact=read('src/pages/Contact.tsx');
assert(contact.includes('htmlFor="message"'));
assert(contact.includes('id="message"'));
assert(contact.includes('Formspree'));
assert(contact.includes('subjects.includes(requested)'));
const resources=read('src/pages/Resources.tsx');
assert(resources.includes('controller.abort()'));
assert(!resources.includes('testflight.apple.com/join/bayan'));
assert(resources.includes('Clear filters'));
assert(resources.includes('https://journalready.ai/'));
assert(!resources.includes('journal-ready.vercel.app'));
assert(!resources.includes("title:'Bayan Mobile'"));
for (const title of ['Medad','SmartBlock','Death certification course','ABG & acid-base course']) {
  assert(resources.includes("title:'"+title+"'"));
}
assert(!read('src/pages/News.tsx').includes('Free for All Residents'));
const news=read('src/pages/News.tsx');
for(const source of ['DeHmkOqDBDq','Daw3WxGDG7Y','Abdullah-Al-Alawi.aspx','1993221279902785756','DUWBgJQjAXI','DSetInHjBib','DSM_IRxDOqA']) assert(news.includes(source));
assert(news.includes("dateSort:'2026-02-24'"));
assert(!news.includes("link:'https://www.omandaily.om'"));
const newsIds=[...news.matchAll(/\{id:(\d+),cat:/g)].map(match=>match[1]);
assert.equal(new Set(newsIds).size,newsIds.length);
assert.equal(newsIds.length,16);
assert(read('src/pages/Home.tsx').includes('DeHmkOqDBDq'));
assert(read('src/pages/About.tsx').includes('page-hero-light'));
assert(read('src/pages/Lectures.tsx').includes("background:'#ffffff'"));
console.log('Public website: event expiry/Oman boundaries, news freshness, research copy, portal routing, contact accessibility and resource fallbacks passed.');
