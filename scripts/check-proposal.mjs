import fs from 'node:fs';

// Compare the rendered explanation with the retained proposal paragraphs and
// table cells. Headings are deliberately grouped into fewer reading sections.
const root=new URL('../',import.meta.url);
const source=JSON.parse(fs.readFileSync(new URL('content/proposal-sections.json',root),'utf8'));
const normal=s=>String(s).replace(/<\/?a\b[^>]*>/g,'').replace(/<[^>]*>/g,' ').replaceAll('&amp;','&').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&quot;','"').replaceAll('&#39;',"'").replace(/\s+/g,' ').trim();
const rendered=normal(['index','experience','personal-aura','community','trial'].map(id=>fs.readFileSync(new URL(`${id}.html`,root),'utf8')).join(' '));
const missing=[];
const pages=new Set();
let checked=0;
for(const chapter of source)for(const block of chapter.blocks){
 if(!['p','callout','table'].includes(block.type))continue;
 pages.add(block.sourcePage);
 const entries=block.text?[block.text]:[...block.headers,...block.rows.flat()];
 for(const value of entries){checked++;if(!rendered.includes(normal(value)))missing.push(`Page ${block.sourcePage}: ${normal(value).slice(0,150)}`);}
}
for(let page=1;page<=22;page++)if(!pages.has(page))missing.push(`Missing proposal page ${page}`);
if(missing.length){console.error(missing.join('\n'));process.exitCode=1;}
else console.log(`Proposal coverage passed: ${checked} paragraphs, callouts and table cells from all 22 explanatory pages.`);
