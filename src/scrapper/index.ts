import { getPageInfos } from "./page-infos";

interface ScrapperOptions {
  ai: AI;
  schema: OpenAIStructuredOutput;
  browserOptions: BrowserOptions;
}

export async function scrapeURL(url: string, options: ScrapperOptions) {
  const pageInfos = await getPageInfos(url, options.browserOptions)
  return await scrapePageByAI(options, pageInfos)
}

async function scrapePageByAI(options: ScrapperOptions, pageInfos: {
  html: string;
  url: string;
}) {
  const response = await options.ai.completions({
    messages: [
      {
        role: 'system',
        content: 'You are an assistant that helps people find the information they need in an HTML document.',
      },
      {
        role: 'user',
        content: `
          - URL: ${pageInfos.url}
          - HTML: ${pageInfos.html}
        `,
      }
    ],
    responseFormat: options.schema,
    stream: false,
  })

  return JSON.parse(response.choices[0].message.content)
}
