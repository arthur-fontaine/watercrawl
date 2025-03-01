import type { z } from "zod";
import { scrapeURL } from "./scrap-url";
import { zodToOpenAIStructuredOutput } from "../services/zod-to-openai-structured-output";

export interface FlowOptions<T extends z.AnyZodObject> {
  // scrap specific options
  ai: AI;
  schema: T;
  browser: Browser;
  // flow specific options
  queue: Queue<{ url: string; retryRemaining?: number }>;
  entryUrl: string;
  then: (data: z.infer<T>, addToQueue: (...urls: string[]) => void) => void;
  id?: string;
}

export async function runFlow<T extends z.AnyZodObject>(options: FlowOptions<T>) {
  options.queue.process(async (job) => {
    const url = job.url;
    const data = await scrapeURL(url, {
      ai: options.ai,
      browser: options.browser,
      schema: zodToOpenAIStructuredOutput(options.schema),
    });
    const parsed = options.schema.parse(data);
    options.then(parsed, (...urls) => {
      urls.forEach((url) => options.queue.add({ url }));
    });
  });

  options.queue.onFailed((job, error) => {
    console.error(`Job ${job.url} failed: ${error.message}`);
  });

  options.queue.onFailed((job, error) => {
    if (job.retryRemaining === 0) {
      console.error(`Job ${job.url} failed and no more retries left: ${error.message}`);
      return;
    }
    options.queue.add({
      url: job.url,
      retryRemaining: job.retryRemaining ? job.retryRemaining - 1 : 3,
    });
  });

  options.queue.add({ url: options.entryUrl });
}
