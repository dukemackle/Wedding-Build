// eslint-disable-next-line @typescript-eslint/no-require-imports -- plain Node script run with node
const { chromium } = require('playwright');
(async () => {
  const [id, view, out] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1600, height: 1000 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(`http://localhost:3100/save-the-date/prototype?view=${view}`, { waitUntil: 'networkidle', timeout: 300000 });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(3000);
  const s = p.locator(`[data-suite="${id}"]`); await s.scrollIntoViewIfNeeded(); await p.waitForTimeout(2000);
  await s.screenshot({ path: out });
  if (errs.length) console.log('ERRORS', errs.slice(0,3).join('\n'));
  await b.close();
})();
