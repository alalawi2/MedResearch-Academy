import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const browser=await chromium.launch({headless:true,channel:'chrome'});
const page=await browser.newPage({viewport:{width:1440,height:1100}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const user={id:'synthetic-reviewer',email:'reviewer@example.test',email_confirmed_at:'2026-01-01',aud:'authenticated',role:'authenticated',app_metadata:{},user_metadata:{},created_at:'2026-01-01'};
const token=['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',Buffer.from(JSON.stringify({sub:user.id,exp:Math.floor(Date.now()/1000)+3600,iat:Math.floor(Date.now()/1000),role:'authenticated'})).toString('base64url'),'test'].join('.');
const session={access_token:token,refresh_token:'synthetic-refresh',token_type:'bearer',expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,user};
let review={version:0,rating:'Not reviewed',notes:'',edited_report:'',numerical_accuracy:'Not assessed',omissions:'Not assessed',unsupported_claims:'Not assessed',clinical_safety:'Not assessed',submitted:false};let failSave=false;let saved=[];
await page.route('**/*.supabase.co/**',async route=>{
 const url=route.request().url();
 if(url.includes('/auth/v1/token'))return route.fulfill({json:session});
 if(url.includes('/auth/v1/user'))return route.fulfill({json:user});
 if(url.includes('/rest/v1/staff?'))return route.fulfill({json:{id:'synthetic-staff',email:user.email,full_name:'Synthetic reviewer'}});
 return route.fulfill({json:[]});
});
await page.route('**/holter/v1/**',async route=>{
 const req=route.request(),url=new URL(req.url());
 if(url.pathname.endsWith('/cases'))return route.fulfill({json:{study:'holter',role:'reviewer',cases:[{id:'R001',...review}],verdict:null}});
 if(url.pathname.includes('/history/'))return route.fulfill({json:saved});
 if(req.method()==='PUT'){
  if(failSave)return route.fulfill({status:503,json:{detail:'Synthetic connection failure'}});
  review={...req.postDataJSON(),version:review.version+1,updated:new Date().toISOString()};saved.push({version:review.version,event:'save',created:review.updated,review:{...review}});return route.fulfill({json:review});
 }
 return route.fulfill({json:{id:'R001',measurements:[{label:'Minimum heart rate',value:55,unit:'bpm'},{label:'Software-labelled AF time',value:null,unit:'%'}],candidate:'SYNTHETIC DEMONSTRATION ONLY. Mean heart rate 70 bpm.',reference:'SYNTHETIC REFERENCE ONLY. Sinus rhythm.',review}});
});
await page.goto('http://127.0.0.1:5173/active-research/holter');
await page.getByLabel('Email',{exact:true}).fill(user.email);await page.getByLabel('Password',{exact:true}).fill('synthetic-password');await page.getByRole('button',{name:'Sign in to Holter'}).click();
await page.getByRole('heading',{name:'XML measurements'}).waitFor();
assert.equal(await page.getByText('Not supplied',{exact:true}).count(),1);
await page.getByLabel('Overall rating').selectOption('Minor edits');
await page.waitForTimeout(1600);
await page.getByLabel('Reviewer notes').fill('Synthetic reviewer correction for a numerical discrepancy.');
await page.waitForTimeout(1700);assert.equal(review.notes,'Synthetic reviewer correction for a numerical discrepancy.');
for(const label of ['Numerical accuracy','Clinically important omissions','Unsupported interpretations','Clinical safety']){await page.getByLabel(label).selectOption('No concern');await page.waitForTimeout(1500);}
await page.evaluate(()=>{(document.activeElement instanceof HTMLElement)&&document.activeElement.blur();window.scrollTo({top:0,behavior:"instant"});});await page.screenshot({path:'/tmp/holter-review-desktop.png',fullPage:true});
await page.reload();await page.getByRole('heading',{name:'XML measurements'}).waitFor();assert.equal(await page.getByLabel('Reviewer notes').inputValue(),review.notes);
failSave=true;await page.getByLabel('Reviewer notes').fill('Unsaved synthetic change');await page.getByRole('alert').waitFor();assert.equal(await page.getByLabel('Assessment',{exact:true}).isDisabled(),true);assert.equal(await page.getByRole('button',{name:'Submit assessment',exact:true}).isDisabled(),true);
failSave=false;await page.getByRole('button',{name:'Save now / retry'}).click();await page.waitForTimeout(500);assert.equal(review.notes,'Unsaved synthetic change');
page.on('dialog',dialog=>dialog.accept());await page.getByRole('button',{name:'Submit assessment',exact:true}).click();await page.waitForTimeout(500);assert.equal(review.submitted,true);assert.equal(await page.getByLabel('Reviewer notes').isDisabled(),true);
await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{(document.activeElement instanceof HTMLElement)&&document.activeElement.blur();window.scrollTo({top:0,behavior:"instant"});});await page.screenshot({path:'/tmp/holter-review-mobile.png',fullPage:true});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth),false);
assert.deepEqual(errors,[]);console.log('PASS: synthetic login, table, autosave, reload, save failure, retry, locked submission, responsive layout, no browser exceptions.');
await browser.close();
