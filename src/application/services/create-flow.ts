import type { z } from "zod";
import { runFlow, type FlowOptions } from "../use-cases/run-flow";

type CreateFlowOptionKeys = 'schema' | 'then' | 'id';
export function createFlow<T extends z.AnyZodObject>(options: Pick<FlowOptions<T>, CreateFlowOptionKeys>) {
  return (otherOptions: Omit<FlowOptions<T>, CreateFlowOptionKeys>) => {
    return runFlow({ ...options, ...otherOptions });
  }
}
