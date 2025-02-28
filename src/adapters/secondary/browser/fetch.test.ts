import { expect, test } from "bun:test"
import { FetchBrowser } from "./fetch"

test('FetchBrowser', async () => {
  const fetchBrowser = new FetchBrowser();

  const response = await fetchBrowser.getPageInfos('https://example.com');

  expect(response.html).toContain('<h1>Example Domain</h1>');
  expect(response.url).toBe('https://example.com');
});
