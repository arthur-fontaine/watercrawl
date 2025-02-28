import type { z } from "zod";
import Bull from "bull";
import { scrapeURL } from "./scrap-url";
import { zodToOpenAIStructuredOutput } from "../services/zod-to-openai-structured-output";

export interface FlowOptions<T extends z.AnyZodObject> {
  // scrap specific options
  ai: AI;
  schema: T;
  browser: Browser;
  // flow specific options
  entryUrl: string;
  then: (data: z.infer<T>, addToQueue: (...urls: string[]) => void) => void;
  id?: string;
}

export async function runFlow<T extends z.AnyZodObject>(options: FlowOptions<T>) {
  const queue = new Bull<{
    url: string;
    retryRemaining?: number;
  }>(options.id || `flow-${Date.now()}`, 'redis://127.0.0.1:6379');

  queue.process(async (job) => {
    const url = job.data.url;
    const data = await scrapeURL(url, {
      ai: options.ai,
      browser: options.browser,
      schema: zodToOpenAIStructuredOutput(options.schema),
    });
    const parsed = options.schema.parse(data);
    options.then(parsed, (...urls) => {
      urls.forEach((url) => queue.add({ url }));
    });
  });

  queue.on('failed', (job, error) => {
    console.error(`Job ${job.id} failed: ${error.message}`);
  });

  queue.on('failed', (job, error) => {
    if (job.data.retryRemaining === 0) {
      console.error(`Job ${job.id} failed and no more retries left: ${error.message}`);
      return;
    }
    queue.add({
      url: job.data.url,
      retryRemaining: job.data.retryRemaining ? job.data.retryRemaining - 1 : 3,
    });
  });

  queue.add({ url: options.entryUrl });
}
