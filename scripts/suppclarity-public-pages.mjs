import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
// Export the same authored text as the native screens. Store reviewers and
// privacy crawlers can read these public pages without JavaScript or app state.
export function publicContentPages(app,destination) {
  const require=createRequire(resolve(app,'package.json'));
  const {parse}=require('@babel/parser');
  for(const route of ['privacy','support','terms']) {
    const ast=parse(readFileSync(resolve(app,'src/app',route+'.tsx'),'utf8'),{sourceType:'module',plugins:['typescript','jsx']});
    const blocks=[];
    function visit(node) {
      if(!node || typeof node!=='object')return;
      if(node.type==='JSXElement' && node.openingElement.name.name==='Copy') {
        const kind=node.openingElement.attributes.find(a=>a.name?.name==='kind')?.value?.value;
        const text=node.children.map(c=>c.type==='JSXText'?c.value:c.type==='JSXExpressionContainer'&&c.expression.type==='StringLiteral'?c.expression.value:'').join('').replace(/\s+/g,' ').trim();
        if(text)blocks.push({tag:kind==='title'?'h1':kind==='heading'?'h2':'p',text});
        return;
      }
      for(const value of Object.values(node))if(Array.isArray(value))value.forEach(visit);else if(value&&typeof value==='object')visit(value);
    }
    visit(ast);
    if(blocks.length<8 || !blocks.some(x=>x.tag==='h1'))throw Error('Missing public '+route+' content');
    const title=route==='privacy'?'SuppClarity privacy policy':route==='terms'?'SuppClarity subscription terms':'SuppClarity help & support';
    const content=blocks.map(x=>`<${x.tag}>${escape(x.text)}</${x.tag}>`).join('\n');
    const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><meta name="description" content="${title} from MedResearch Academy"><style>body{margin:0;background:#F8F8FA;color:#20232B;font:17px/1.7 system-ui,-apple-system,sans-serif}main{max-width:740px;margin:auto;padding:36px 24px 64px}nav{display:flex;flex-wrap:wrap;gap:20px;margin-bottom:34px}a{color:#6955DF;text-underline-offset:4px}h1{font-size:clamp(30px,6vw,44px);line-height:1.2;letter-spacing:-1px}h2{font-size:23px;margin-top:38px}p{margin:18px 0}footer{border-top:1px solid #ddd8ec;margin-top:40px;padding-top:24px}a:focus-visible{outline:3px solid #6955DF;outline-offset:5px}</style></head><body><main><nav aria-label="SuppClarity"><a href="/suppclarity/">Open SuppClarity</a><a href="/suppclarity/privacy">Privacy</a><a href="/suppclarity/support">Help &amp; support</a></nav>${content}<footer><p><a href="mailto:info@medresearch-academy.om">Email MedResearch Academy</a></p><p><a href="https://openai.com/policies/privacy-policy/">OpenAI privacy policy</a> · <a href="https://consensus.app/privacy-policy/">Consensus privacy policy</a></p></footer></main></body></html>`;
    mkdirSync(resolve(destination,route),{recursive:true});writeFileSync(resolve(destination,route,'index.html'),html);
  }
}
