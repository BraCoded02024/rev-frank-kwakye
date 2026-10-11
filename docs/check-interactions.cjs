const { chromium } = require(process.env.JOURNEY_PLAYWRIGHT || 'playwright');
const assert = require('node:assert/strict');
require('node:fs').mkdirSync('.checks', {recursive:true});
(async()=>{
const browser=await chromium.launch({headless:true,channel:'msedge'});
try {
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://localhost:3000');
await page.waitForSelector('canvas[data-camera-z]',{timeout:60000});
for(const [label,p] of [['Calling',.13],['Ministry',.24],['The Word',.5],['Leadership',.705],['Prologue',0]]){
await page.getByRole('navigation',{name:'Journey chapters'}).getByRole('button',{name:label}).click();
await page.waitForFunction(p=>Math.abs(Number(document.querySelector('canvas')?.dataset.travel)-p)<.003,p,{timeout:30000});
console.log('chapter',label,await page.locator('canvas').getAttribute('data-room'));
}
for (let i=0;i<3;i++){
await page.getByRole('button',{name:'Watch messages',exact:true}).click();
await page.locator('dialog[open]').waitFor();
await page.getByRole('button',{name:/Youth teaching/}).click();
assert.equal(await page.locator('.sermon-selection>p').innerText(),'Youth teaching');
if(i===0) await page.keyboard.press('Escape'); else await page.getByRole('button',{name:'Close theater ×'}).click();
await page.waitForFunction(()=>!document.querySelector('dialog').open && document.body.style.overflow!=='hidden');
}
await page.getByRole('button',{name:'Read the story',exact:true}).click();
await page.locator('.spatial-reading').waitFor();
assert.equal(await page.evaluate(()=>scrollY),0);
await page.getByRole('button',{name:'Enter the spatial journey ↗'}).click();
await page.waitForSelector('canvas[data-camera-z]');
assert.equal(await page.locator('canvas').getAttribute('data-travel'),'0.0000');
await page.setViewportSize({width:390,height:844});
await page.screenshot({path:'.checks/mobile-home.png'});
assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile overflow');
await page.getByRole('button',{name:'Watch messages',exact:true}).click();
await page.screenshot({path:'.checks/mobile-theater.png'});
await page.getByRole('button',{name:'Close theater ×'}).click();
await page.getByRole('link',{name:'An invitation ↗'}).click();
await page.waitForSelector('.invitation-page');
assert.equal(await page.locator('.intro-gate, canvas, video').count(),0);
console.log('contact',page.url());
await page.goto('http://localhost:3000/messages');
await page.getByRole('button',{name:'Skip',exact:true}).click({timeout:5000}).catch(async error => { if (await page.locator('.intro-gate:not(.is-leaving)').count()) throw error; });
await page.waitForSelector('.nav');
await page.getByRole('button',{name:'Open menu'}).click();
await page.getByRole('button',{name:'Close menu'}).click();
await page.getByRole('button',{name:'Open menu'}).click();
await page.keyboard.press('Escape');
await page.getByRole('button',{name:'Open menu'}).click();
await page.locator('.mobile-menu').getByRole('link',{name:'Videos'}).click();
await page.waitForFunction(()=>document.querySelector('#videos')?.getBoundingClientRect().top<200,{timeout:15000});
assert(await page.locator('.sermon-theater').count()===1);
console.log('videos',page.url());
await page.getByRole('button',{name:'Open menu'}).click();
await page.locator('.mobile-menu').getByRole('link',{name:'Profile'}).click();
await page.waitForFunction(()=>Math.abs(document.querySelector("#word")?.getBoundingClientRect().top)<10);
assert(await page.locator('#word').count()===1);
console.log('profile',page.url());
await page.getByRole('link',{name:'Frank Kwakye',exact:true}).click();
await page.waitForSelector('.spatial-journey');
await page.emulateMedia({reducedMotion:'reduce'});
await page.waitForSelector('.spatial-reading');
await page.waitForFunction(()=>[...document.querySelectorAll('canvas')].every(canvas=>canvas.getBoundingClientRect().width===0), undefined, {polling:100});
assert.equal(errors.length,0,errors.join('\n'));
console.log('PASS: all chapters, repeated modal opens, Escape, topics, reading return, mobile, contact, menu, profile/home navigation, reduced motion, no runtime errors');
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});









