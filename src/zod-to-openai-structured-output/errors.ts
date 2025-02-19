import type { z } from "zod";

export class UnsupportedZodType extends Error {
  constructor(zodType: z.ZodType<any>) {
    super(`Unsupported Zod type: ${Object.getPrototypeOf(zodType).constructor.name}`);
  }
}

export class BadSchemaDescription extends Error {
  constructor(reason: string) {
    super(`Bad schema description: ${reason}`);
  }
}
