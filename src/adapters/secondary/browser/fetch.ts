interface FetchOptions {
  requestOptions?: RequestInit | (() => Promise<RequestInit>);
}

export class FetchBrowser implements Browser {
  #options: FetchOptions;

  constructor(options?: FetchOptions) {
    this.#options = options || {};
  }

  async getPageInfos(url: string): Promise<PageInfos> {
    const requestOptions = typeof this.#options.requestOptions === 'function'
      ? await this.#options.requestOptions()
      : this.#options.requestOptions;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'text/html',
        ...requestOptions?.headers,
      },
      ...requestOptions,
    });
    const html = await response.text();

    return { html, url };
  }
}
