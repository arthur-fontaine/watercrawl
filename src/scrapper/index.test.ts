import { test, expect, beforeAll, afterAll } from 'bun:test'
import puppeteer, { type Browser } from 'puppeteer'
import { scrapeURL } from '.'
import { OpenAI } from '../ai'

let browser: Browser

beforeAll(async () => {
  browser = await puppeteer.launch()
})

afterAll(async () => {
  await browser.close()
})

test('scrapping', async () => {
  const result = await scrapeURL('https://example.com', {
    ai: new OpenAI({
      model: 'google/gemini-2.0-flash-lite-preview-02-05:free',
      apiKey: process.env.OPENROUTER_API_KEY,
      baseUrl: 'https://openrouter.ai/api'
    }),
    browserOptions: {
      browserWSEndpoint: browser.wsEndpoint(),
    },
    schema: {
      type: 'json_schema',
      json_schema: {
        name: 'Example',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            links: { type: 'array', items: { type: 'string' } },
          },
          required: ['title', 'description', 'links'],
          additionalProperties: false,
        },
      },
    },
  })

  expect(result).toHaveProperty('title', 'Example Domain')
  expect(result).toHaveProperty('links', ['https://www.iana.org/domains/example'])
  expect(result).toHaveProperty('description')
  expect(result.description).toEqualIgnoringWhitespace('This domain is for use in illustrative examples in documents. You may use this domain in literature without prior coordination or asking for permission.')
})
