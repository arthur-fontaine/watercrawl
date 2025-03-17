import { createCommand } from "commander";
import { scrapeURL } from "../../../../application/use-cases/scrap-url";
import { OpenAI } from "../../../secondary/ai";
import { PuppeteerBrowser } from "../../../secondary/browser";
import { loadConfig } from "../../../../config";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { toJsonSchema } from "xsschema";

export const scrapeCommand = createCommand('scrape')
  .description('Scrape a website')
  .argument('<url>', 'The URL to scrape')
  .option('-s, --schema <schema>', 'The schema file', 'schema.ts')
  .action(async (url, { schema: schemaFile }) => {
    const config = loadConfig()

    const schemaModule = await import(`${process.cwd()}/${schemaFile}`)
    const schema = schemaModule.default as StandardSchemaV1
    const schemaName = schemaModule.name as string
    const jsonSchema = await toJsonSchema(schema)

    const result = await scrapeURL(url, {
      ai: schemaModule.ai ?? new OpenAI({
        baseUrl: config.openai.baseUrl,
        apiKey: config.openai.apiKey,
        model: config.openai.model,
      }),
      schema: {
        type: "json_schema",
        json_schema: {
          name: jsonSchema.title ?? jsonSchema.$ref ?? schemaName ?? "object",
          schema: jsonSchema,
          strict: true,
        },
      },
      browser: schemaModule.browser ?? new PuppeteerBrowser({
        browserWSEndpoint: config.browser.browserWSEndpoint,
      }),
    })

    process.stdout.write(JSON.stringify(result, null, 2))
  })
