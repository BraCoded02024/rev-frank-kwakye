const { chromium } = require(process.env.JOURNEY_PLAYWRIGHT || 'playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
(async () => {
  fs.mkdirSync('docs/spatial-preview', { recursive: true });
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', e => { if (e.type() === 'error') console.log('CONSOLE', e.text()); });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForSelector('canvas[data-camera-z]', { timeout: 60000 });
    await page.waitForFunction(() => Number(document.querySelector('canvas')?.dataset.filmTime) > 1, { timeout: 20000 });
    const samples = [];
    for (const [name, progress] of [['prologue', 0], ['door-one-approach', .055], ['door-one-crossing', .09], ['calling', .13], ['portrait-near', .17], ['door-two-approach', .19], ['door-two-crossing', .215], ['ministry', .24]]) {
      await page.evaluate(p => scrollTo(0, p * (document.documentElement.scrollHeight - innerHeight)), progress);
      await page.waitForFunction(p => Math.abs(Number(document.querySelector('canvas')?.dataset.travel) - p) < .002, progress, { timeout: 20000 });
      await page.screenshot({ path: `docs/spatial-preview/${name}.png` });
      samples.push({ name, ...await page.locator('canvas').evaluate(c => ({ z: Number(c.dataset.cameraZ), x: Number(c.dataset.cameraX), door01: Number(c.dataset.door01), door02: Number(c.dataset.door02), top: c.getBoundingClientRect().top })) });
    }
    console.log(JSON.stringify(samples, null, 2));
    assert(samples.every(s => s.top === 0), 'Canvas must stay fixed while scrolling');
    assert(samples.every((s, i) => i === 0 || s.z < samples[i - 1].z), 'Camera must move forward along negative Z');
    assert(samples[2].z < -6 && samples[2].door01 > 1.4, 'Camera crosses open door one');
    assert(samples[6].z < -27 && samples[6].door02 > 1.4, 'Camera crosses open door two');
    await page.getByRole('button', { name: 'Calling', exact: false }).click();
    await page.waitForFunction(() => Math.abs(Number(document.querySelector('canvas')?.dataset.travel) - .13) < .002);
    await page.mouse.wheel(0, -500);
    await page.waitForTimeout(1500);
    assert(await page.locator('canvas').evaluate(c => Number(c.dataset.cameraZ)) > samples[3].z, 'Reverse scroll walks backwards');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: 'Calling', exact: false }).click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'docs/spatial-preview/mobile-calling.png' });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No horizontal overflow');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('.spatial-reading');
    assert(await page.locator('canvas').count() === 0, 'Reduced motion must not run the camera');
    await page.screenshot({ path: 'docs/spatial-preview/reduced.png' });
    assert.equal(errors.length, 0, errors.join('\n'));
    console.log('PASS: forward camera travel, physical door crossings, reverse travel, chapter navigation, mobile, reduced motion, runtime errors');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

