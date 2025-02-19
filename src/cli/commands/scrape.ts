import { createCommand } from "commander";
import { scrapeURL } from "../../scrapper";
import { OpenAI } from "../../ai";
import type { z } from "zod";
import { zodToOpenAIStructuredOutput } from "../../zod-to-openai-structured-output";

export const scrapeCommand = createCommand('scrape')
  .description('Scrape a website')
  .argument('<url>', 'The URL to scrape')
  .action(async (url: string) => {
    const schemaModule = await import(process.cwd() + '/schema.ts')
    const schema = schemaModule.default as z.AnyZodObject

    const result = await scrapeURL(url, {
      ai: new OpenAI({
        baseUrl: Bun.env.OPENAI_BASE_URL ?? 'https://api.openai.com',
        apiKey: Bun.env.OPENAI_API_KEY,
        model: Bun.env.OPENAI_MODEL ?? 'davinci',
      }),
      schema: zodToOpenAIStructuredOutput(schema),
      browserOptions: {
        browserWSEndpoint: Bun.env.BROWSER_WS_ENDPOINT ?? 'ws://localhost:9222',
      },
    })

    process.stdout.write(JSON.stringify(result, null, 2))
  })
