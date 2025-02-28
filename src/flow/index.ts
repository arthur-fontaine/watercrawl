import type { z } from "zod";
import Bull from "bull";
import { scrapeURL } from "../scrapper";
import { zodToOpenAIStructuredOutput } from "../zod-to-openai-structured-output";
import type { FlowOptions } from "./flow";

export async function flow<T extends z.AnyZodObject>({
  id,
  schema,
  ai,
  entryUrl,
  browserOptions,
  then,
}: FlowOptions<T>) {
  const queue = new Bull<{
    url: string;
    retryRemaining?: number;
  }>(id || `flow-${Date.now()}`, 'redis://127.0.0.1:6379');

  queue.process(async (job) => {
    const url = job.data.url;
    const data = await scrapeURL(url, {
      ai,
      browserOptions,
      schema: zodToOpenAIStructuredOutput(schema),
    });
    const parsed = schema.parse(data);
    then(parsed, (...urls) => {
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

  queue.add({ url: entryUrl });
}
