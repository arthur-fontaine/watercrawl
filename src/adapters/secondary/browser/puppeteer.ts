import * as puppeteer from 'puppeteer-core';

interface PuppeteerOptions {
  browserWSEndpoint: string;
}

export class PuppeteerBrowser implements Browser {
  #options: PuppeteerOptions;
  #browser: Promise<puppeteer.Browser>;

  constructor(options: PuppeteerOptions) {
    this.#options = options;
    this.#browser = puppeteer.connect({
      browserWSEndpoint: options.browserWSEndpoint,
    });
  }

  async getPageInfos(url: string): Promise<PageInfos> {
    const browser = await this.#browser;

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const html = await page.content();
    await page.close();
    return { html, url };
  }
}
