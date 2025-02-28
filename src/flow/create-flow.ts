import type { z } from "zod";
import { flow } from ".";
import type { FlowOptions } from "./flow";

type CreateFlowOptionKeys = 'schema' | 'then' | 'id';
export function createFlow<T extends z.AnyZodObject>(options: Pick<FlowOptions<T>, CreateFlowOptionKeys>) {
  return (otherOptions: Omit<FlowOptions<T>, CreateFlowOptionKeys>) => {
    return flow({ ...options, ...otherOptions });
  }
}
