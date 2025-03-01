import { expect, test } from "bun:test"
import { HappyDomBrowser } from "./happy-dom";

test('HappyDomBrowser', async () => {
  const fetchBrowser = new HappyDomBrowser({
    selectors: ['h1']
  });

  const response = await fetchBrowser.getPageInfos('https://example.com');

  expect(response.html).toContain('<h1>Example Domain</h1>');
  expect(response.html).not.toContain('<html>');
  expect(response.html).not.toContain('<p>');
  expect(response.url).toBe('https://example.com');
});
