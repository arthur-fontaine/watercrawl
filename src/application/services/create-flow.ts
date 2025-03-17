import { runFlow, type FlowOptions } from "../use-cases/run-flow";

type CreateFlowOptionKeys = 'schema' | 'then' | 'id' | 'schemaName';

/**
 * Create a flow to scrape a URL and optionally queue more URLs to be scraped.
 */
export function createFlow<I, O>(options: Pick<FlowOptions<I, O>, CreateFlowOptionKeys>) {
  return (otherOptions: Omit<FlowOptions<I, O>, CreateFlowOptionKeys>) => {
    return runFlow({ ...options, ...otherOptions });
  }
}
