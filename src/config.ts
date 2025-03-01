export function loadConfig() {
  return {
    openai: {
      baseUrl: Bun.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1',
      apiKey: Bun.env.OPENAI_API_KEY,
      model: Bun.env.OPENAI_MODEL ?? 'davinci',
    },
    browser: {
      browserWSEndpoint: Bun.env.BROWSER_WS_ENDPOINT ?? 'ws://localhost:9222',
    },
    queue: {
      name: `flow-${Date.now()}`,
      redis: {
        host: '127.0.0.1',
        port: 6379,
      },
    },
  }
}
