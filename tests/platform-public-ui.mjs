import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  const page=await browser.newPage({viewport});const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('https://www.medresearch-academy.om/researcher',{waitUntil:'networkidle'});
  await page.getByRole('heading',{name:'Researcher sign in'}).waitFor();
  assert.equal(await page.locator('input[type=email]').count(),1);
  assert.equal(await page.locator('input[type=password]').count(),0);
  await page.goto('https://www.medresearch-academy.om/surveys',{waitUntil:'networkidle'});
  assert.equal(errors.length,0,errors.join(';'));
  console.log(viewport.width,'px: verified researcher login and public survey pages render without runtime errors');
  await page.close();
 }
}finally{await browser.close();}
