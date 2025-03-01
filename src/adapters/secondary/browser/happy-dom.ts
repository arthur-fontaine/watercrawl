import { Window } from "happy-dom";
import { FetchBrowser } from "./fetch";

interface HappyDomOptions {
  /**
   * CSS selectors to extract from the page
   * @example ['h1', 'a[href]', '.content']
   */
  selectors: string[];
  /**
   * Fetch options
   * @example { headers: { 'User-Agent': 'Mozilla/5.0' } }
   */
  requestOptions?: RequestInit | (() => Promise<RequestInit>);
}

export class HappyDomBrowser extends FetchBrowser implements Browser {
  #options: HappyDomOptions;

  constructor(options: HappyDomOptions) {
    super(options);
    this.#options = options;
  }

  async getPageInfos(url: string): Promise<PageInfos> {
    const { html } = await super.getPageInfos(url);
    
    const window = new Window({ url });
    const document = window.document;
    document.body.innerHTML = html;

    const elements = document.querySelectorAll(this.#options.selectors.join(', '));
    const outerHTMLs = Array.from(elements).map(element => element.outerHTML).join('\n');

    return { html: outerHTMLs, url };
  }
}
