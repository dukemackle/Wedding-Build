// eslint-disable-next-line @typescript-eslint/no-require-imports -- plain Node script run with node
const { chromium } = require('playwright');
// TPLS=<ids> node scripts/batch-a/preview-site.js <tag> [suffix]  -> full-<tpl>-<w>-<tag>.png (whole page) for TPLS at 1440 and 375
(async () => {
  const [tag = 'f', suffix = ''] = process.argv.slice(2);
  const tpls = (process.env.TPLS || 'highland-lake').split(',');
  const b = await chromium.launch();
  for (const w of [1440, 375]) {
    const p = await b.newPage({ viewport: { width: w, height: w > 500 ? 900 : 812 } });
    const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    for (const t of tpls) {
      await p.goto(`http://localhost:3100/save-the-date/prototype/site?t=${t}${suffix}`, { waitUntil: 'networkidle', timeout: 180000 });
      await p.evaluate(() => document.fonts.ready); await p.evaluate(async () => { for (const i of document.images) { i.loading = 'eager'; if (!i.complete) await new Promise((r) => { i.onload = i.onerror = r; setTimeout(r, 8000); }); } }); await p.waitForTimeout(1500);
      const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      const ph = await p.evaluate(() => document.documentElement.scrollHeight);
      await p.setViewportSize({ width: w, height: ph }); await p.waitForTimeout(2500);
      await p.screenshot({ path: `full-${t}-${w}-${tag}.png` });
      await p.setViewportSize({ width: w, height: w > 500 ? 900 : 812 });
      console.log(t, w, 'overflow', overflow);
    }
    if (errs.length) console.log('ERRORS', [...new Set(errs)].slice(0, 5).join('\n'));
    await p.close();
  }
  await b.close();
})();
