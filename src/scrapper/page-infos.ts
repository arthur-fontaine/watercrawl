import puppeteer from 'puppeteer-core';

export async function getPageInfos(url: string, browserOptions: BrowserOptions) {
  const browser = await puppeteer.connect({
    browserWSEndpoint: browserOptions.browserWSEndpoint,
  });

  const page = await browser.newPage();
  await page.goto(url);

  const html = await page.content();
  return { html, url };
}
