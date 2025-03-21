import * as puppeteer from 'puppeteer-core';

interface PuppeteerOptions {
  /**
   * Browser WebSocket endpoint
   * @example 'ws://localhost:9222/devtools/browser/1234'
   */
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
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36');

    await page.goto(`${url}`, { waitUntil: 'domcontentloaded' });

    const html = await page.content();
    await page.close();
    return { html, url };
  }
}
