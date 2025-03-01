export interface ScrapperOptions {
  ai: AI;
  schema: OpenAIStructuredOutput;
  browser: Browser;
}

export async function scrapeURL(url: string, options: ScrapperOptions) {
  const pageInfos = await options.browser.getPageInfos(url);
  return await scrapePageByAI(options, pageInfos);
}

async function scrapePageByAI(options: ScrapperOptions, pageInfos: {
  html: string;
  url: string;
}) {
  let response;
  let retries = 3;

  do {
    response = await options.ai.completions({
      messages: [
        {
          role: 'system',
          content: 'You are a smart assistant that helps people find the information they need in an HTML document. Return the exact information that is requested in the schema, no more, no less. Pay attention to the schema and the schema descriptions. Stricly follow the schema descriptions. Always return valid JSON.',
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
    });

    if (response.choices !== undefined) {
      return JSON.parse(response.choices[0].message.content);
    }

    retries--;
  } while (retries > 0);
}
