import type { z } from "zod";

interface FlowOptions<T extends z.AnyZodObject> {
  ai: AI;

  browserOptions: BrowserOptions;
  schema: T;

  entryUrl: string;
  then: (data: z.infer<T>, addToQueue: (...urls: string[]) => void) => void;
  id?: string;
}