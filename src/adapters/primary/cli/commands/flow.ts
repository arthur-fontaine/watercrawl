import { createCommand } from "commander";
import { OpenAI } from "../../../secondary/ai";
import type { createFlow } from "../../../../application/services/create-flow";
import { PuppeteerBrowser } from "../../../secondary/browser";
import { BullQueue } from "../../../secondary/queue";

export const flowCommand = createCommand('flow')
  .description('Run a flow')
  .argument('<url>', 'The entry URL')
  .action(async (url) => {
    const flowModule = await import(process.cwd() + '/flow.ts')
    const flow = flowModule.default as ReturnType<typeof createFlow>

    await flow({
      entryUrl: url,
      ai: new OpenAI({
        baseUrl: Bun.env.OPENAI_BASE_URL ?? 'https://api.openai.com',
        apiKey: Bun.env.OPENAI_API_KEY,
        model: Bun.env.OPENAI_MODEL ?? 'davinci',
      }),
      browser: new PuppeteerBrowser({
        browserWSEndpoint: Bun.env.BROWSER_WS_ENDPOINT ?? 'ws://localhost:9222',
      }),
      queue: new BullQueue({
        name: `flow-${Date.now()}`,
        redisHost: '127.0.0.1',
        redisPort: 6379,
      }),
    })
  })
