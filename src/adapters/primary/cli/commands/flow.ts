import { createCommand } from "commander";
import { OpenAI } from "../../../secondary/ai";
import type { createFlow } from "../../../../application/services/create-flow";
import { PuppeteerBrowser } from "../../../secondary/browser";
import { BullQueue } from "../../../secondary/queue";
import { loadConfig } from "../../../../config";

export const flowCommand = createCommand('flow')
  .description('Run a flow')
  .argument('<url>', 'The entry URL')
  .option('-f, --flow <flow>', 'The flow file', 'flow.ts')
  .action(async (url, { flow: flowFile }) => {
    const config = loadConfig()
    
    const flowModule = await import(`${process.cwd()}/${flowFile}`)
    const flow = flowModule.default as ReturnType<typeof createFlow>

    await flow({
      entryUrl: url,
      ai: flowModule.ai ?? new OpenAI({
        baseUrl: config.openai.baseUrl,
        apiKey: config.openai.apiKey,
        model: config.openai.model,
      }),
      browser: flowModule.browser ?? new PuppeteerBrowser({
        browserWSEndpoint: config.browser.browserWSEndpoint,
      }),
      queue: flowModule.queue ?? new BullQueue({
        name: config.queue.name,
        redis: config.queue.redis,
      }),
    })
  })
