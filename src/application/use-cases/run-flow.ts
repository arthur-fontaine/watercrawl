import { scrapeURL } from "./scrap-url";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { toJsonSchema } from "xsschema";
import { SchemaParsingError } from "../../domain/errors/schema-parsing-error";

export interface FlowOptions<I, O> {
  // scrap specific options
  ai: AI;
  schema: StandardSchemaV1<I, O>;
  schemaName?: string;
  browser: Browser;
  // flow specific options
  queue: Queue<{ url: string; retryRemaining?: number }, O>;
  /**
   * URL to start the flow
   * @example "https://example.com"
   */
  entryUrl: string;
  /**
   * Function to run after scraping the URL. Use this function to save the data to a database and add more URLs to the queue.
   */
  then: (data: O, addToQueue: (...urls: string[]) => void) => void;
  /**
   * Unique identifier for the flow
   */
  id?: string;
}

/**
 * Scrape a URL and optionally queue more URLs to be scraped.
 */
export async function runFlow<I, O>(options: FlowOptions<I, O>) {
  const alreadyProcessed = new Set<string>();
  const jsonSchema = await toJsonSchema(options.schema);

  options.queue.process(async (job) => {
    const url = job.url;

    const data = await scrapeURL(url, {
      ai: options.ai,
      browser: options.browser,
      schema: {
        type: "json_schema",
        json_schema: {
          name: jsonSchema.title ?? jsonSchema.$ref ?? options.schemaName ?? "object",
          schema: jsonSchema,
          strict: true,
        },
      },
    });
    alreadyProcessed.add(url);

    const parsed = await options.schema["~standard"].validate(data);

    if (parsed.issues !== undefined) {
      throw new SchemaParsingError(parsed.issues);
    }

    options.then(parsed.value, (...urls) => {
      urls.forEach((url) => {
        if (!alreadyProcessed.has(url)) {
          options.queue.add({ url });
        }
      });
    });

    return parsed.value;
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
