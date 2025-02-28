import { createCommand } from "commander";
import { OpenAI } from "../../ai";
import type { createFlow } from "../../flow/create-flow";

export const flowCommand = createCommand('flow')
  .description('Run a flow')
  .argument('<url>', 'The entry URL')
  .action(async (url) => {
    const flowModule = await import(process.cwd() + '/flow.ts')
    const flow = flowModule.default as ReturnType<typeof createFlow>

    flow({
      entryUrl: url,
      ai: new OpenAI({
        baseUrl: Bun.env.OPENAI_BASE_URL ?? 'https://api.openai.com',
        apiKey: Bun.env.OPENAI_API_KEY,
        model: Bun.env.OPENAI_MODEL ?? 'davinci',
      }),
      browserOptions: {
        browserWSEndpoint: Bun.env.BROWSER_WS_ENDPOINT ?? 'ws://localhost:9222',
      },
    })
  })
