import { expect, test } from "bun:test"
import { setTimeout } from "node:timers/promises"
import { JsQueue } from "./jsqueue"

test('JsQueue', async () => {
  const jsQueue = new JsQueue<string>();

  await jsQueue.add('https://example.com');

  let url = '';
  jsQueue.process(async (data) => {
    url = data;
  });

  expect(url).toBe('https://example.com');
});

test('JsQueue with multiple jobs', async () => {
  const jsQueue = new JsQueue<string>({
    concurrency: 1,
  });

  await jsQueue.add('https://example.com');
  await jsQueue.add('https://example.org');

  const urls: string[] = [];
  jsQueue.process(async (data) => {
    await setTimeout(100);
    urls.push(data);
  });

  expect(urls).toEqual([]);
  await setTimeout(101);
  expect(urls).toEqual(['https://example.com']);
  await setTimeout(101);
  expect(urls).toEqual(['https://example.com', 'https://example.org']);
});

test('JsQueue with concurrency', async () => {
  const jsQueue = new JsQueue<string>({
    concurrency: 2,
  });

  await jsQueue.add('https://example.com');
  await jsQueue.add('https://example.org');

  const urls: string[] = [];
  jsQueue.process(async (data) => {
    await setTimeout(100); // wait for 100ms before pushing the URL
    urls.push(data);
  });

  await setTimeout(99); // at 99ms, the jobs didn't finish yet so the URLs should be empty
  expect(urls).toEqual([]);
  await setTimeout(2); // at 101ms (99ms + 2ms), the jobs should finish and the URLs should be pushed
  expect(urls).toEqual(['https://example.com', 'https://example.org']);
});

test('JsQueue with failure handler', async () => {
  const jsQueue = new JsQueue<string>();

  await jsQueue.add('https://example.com');

  const errors: Error[] = [];
  jsQueue.onFailed((data, error) => {
    errors.push(error);
  });

  jsQueue.process(async (data) => {
    throw new Error('Failed to process');
  });

  await setTimeout(0); // wait for the jobs to finish
  expect(errors.length).toBe(1);
  expect(errors[0].message).toBe('Failed to process');
});
