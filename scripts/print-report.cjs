const {chromium}=require('@playwright/test');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const fs=require('node:fs');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
const page=await browser.newPage();await page.goto(pathToFileURL(path.resolve('docs/BAO-CAO-DE-11.html')).href);await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
let overflow=await page.locator('.page').evaluateAll(pages=>pages.map((e,i)=>({page:i+1,height:e.clientHeight,content:e.scrollHeight})).filter(e=>e.content>e.height+2));
if(overflow.length){await page.addStyleTag({content:'body{font-size:12pt;line-height:1.25}figure img{max-height:70mm}pre{font-size:8.5pt}.toc{font-size:10pt;margin-bottom:1.5mm}'});overflow=await page.locator('.page').evaluateAll(pages=>pages.map((e,i)=>({page:i+1,height:e.clientHeight,content:e.scrollHeight})).filter(e=>e.content>e.height+2));}
if(overflow.length)throw new Error('Report page overflow: '+JSON.stringify(overflow));
await page.pdf({path:'docs/BAO-CAO-DE-11.pdf',format:'A4',printBackground:true,displayHeaderFooter:true,headerTemplate:'<span></span>',footerTemplate:'<div style="font-family:Arial;font-size:9px;width:100%;text-align:center;color:#777">Lee Cinema · Trang <span class="pageNumber"></span> / <span class="totalPages"></span></div>',margin:{top:'20mm',bottom:'20mm',left:'30mm',right:'20mm'}});
const pdf=fs.readFileSync('docs/BAO-CAO-DE-11.pdf').toString('latin1');const pages=(pdf.match(/\/Type\s*\/Page\b/g)||[]).length;const designed=await page.locator('.page').count();if(pages!==designed||pages<10)throw new Error(`Unexpected PDF pagination ${pages}/${designed}`);
const meta=JSON.parse(fs.readFileSync('docs/report-build.json'));meta.pdf_pages=pages;meta.html_overflow=false;fs.writeFileSync('docs/report-build.json',JSON.stringify(meta,null,2));console.log(`PASS: report PDF ${pages} pages, images loaded, no content overflow.`);
}finally{await browser.close();}})().catch(e=>{console.error(e.message);process.exit(1)});
