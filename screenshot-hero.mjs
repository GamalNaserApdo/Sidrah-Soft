import { chromium } from 'playwright';

const VIEWPORT = { width: 1920, height: 1080 };

async function scrollAndScreenshot(page, scrollY, filename) {
  await page.evaluate((y) => window.scrollTo(0, y), scrollY);
  await page.waitForTimeout(500);
  await page.screenshot({ path: filename, fullPage: false });
  console.log(`Screenshot saved: ${filename} at scroll ${scrollY}px`);
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: VIEWPORT });
  await page.goto('http://localhost:4173/');

  await page.waitForFunction(() => {
    const status = document.querySelector('.cinematic-status');
    return !status;
  }, { timeout: 120000 });

  // Allow all 366 frames to finish loading progressively.
  await page.waitForTimeout(10000);

  const vh = VIEWPORT.height / 100;
  const heroHeightPx = 400 * vh;
  const scrollRange = heroHeightPx - VIEWPORT.height;

  const progress84 = Math.round(0.84 * scrollRange);
  const progress92 = Math.round(0.92 * scrollRange);
  const progress100 = scrollRange;

  await scrollAndScreenshot(page, progress84, 'hero-progress-84.png');
  await scrollAndScreenshot(page, progress92, 'hero-progress-92.png');
  await scrollAndScreenshot(page, progress100, 'hero-progress-100.png');

  await browser.close();
})();
