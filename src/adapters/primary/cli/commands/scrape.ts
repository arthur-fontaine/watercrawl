import { createCommand } from "commander";
import { scrapeURL } from "../../../../application/use-cases/scrap-url";
import { OpenAI } from "../../../secondary/ai";
import type { z } from "zod";
import { zodToOpenAIStructuredOutput } from "../../../../application/services/zod-to-openai-structured-output";
import { PuppeteerBrowser } from "../../../secondary/browser";
import { loadConfig } from "../../../../config";

export const scrapeCommand = createCommand('scrape')
  .description('Scrape a website')
  .argument('<url>', 'The URL to scrape')
  .option('-s, --schema <schema>', 'The schema file', 'schema.ts')
  .action(async (url, { schema: schemaFile }) => {
    const config = loadConfig()

    const schemaModule = await import(`${process.cwd()}/${schemaFile}`)
    const schema = schemaModule.default as z.AnyZodObject

    const result = await scrapeURL(url, {
      ai: schemaModule.ai ?? new OpenAI({
        baseUrl: config.openai.baseUrl,
        apiKey: config.openai.apiKey,
        model: config.openai.model,
      }),
      schema: zodToOpenAIStructuredOutput(schema),
      browser: schemaModule.browser ?? new PuppeteerBrowser({
        browserWSEndpoint: config.browser.browserWSEndpoint,
      }),
    })

    process.stdout.write(JSON.stringify(result, null, 2))
  })
