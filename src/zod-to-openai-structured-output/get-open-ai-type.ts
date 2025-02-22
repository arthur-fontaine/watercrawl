import { z } from "zod";
import { UnsupportedZodType } from "./errors";

export function getOpenAIType(zodType: z.ZodType<any>): OpenAIStructuredOutputSchema {
  if (zodType instanceof z.ZodObject) return getOpenAIObjectSchema(zodType);
  if (zodType instanceof z.ZodArray) return getOpenAIArraySchema(zodType);
  if (zodType instanceof z.ZodString) return getOpenAIStringSchema(zodType);
  if (zodType instanceof z.ZodNumber) return getOpenAINumberSchema(zodType);
  if (zodType instanceof z.ZodEffects) return getOpenAIType(zodType._def.schema);

  throw new UnsupportedZodType(zodType);
}

export function getOpenAIObjectSchema(zodType: z.ZodObject<any>): OpenAIStructuredOutputObjectSchema {
  const properties: Record<string, OpenAIStructuredOutputSchema> = {};
  const required: string[] = [];

  for (const key in zodType.shape) {
    const value = zodType.shape[key];
    if (value instanceof z.ZodOptional) {
      properties[key] = getOpenAIType(value._def.innerType);
    } else {
      properties[key] = getOpenAIType(value);
      required.push(key);
    }
  }

  return addBaseSchemaProperties({
    type: 'object',
    properties,
    required,
    additionalProperties: zodType._def.unknownKeys !== 'strict',
  }, zodType);
}

export function getOpenAIArraySchema(zodType: z.ZodArray<any>): OpenAIStructuredOutputArraySchema {
  return addBaseSchemaProperties({
    type: 'array',
    items: getOpenAIType(zodType.element),
  }, zodType);
}

export function getOpenAIStringSchema(zodType: z.ZodString): OpenAIStructuredOutputStringSchema {
  return addBaseSchemaProperties({
    type: 'string',
  }, zodType);
}

export function getOpenAINumberSchema(zodType: z.ZodNumber): OpenAIStructuredOutputNumberSchema {
  return addBaseSchemaProperties({
    type: 'number',
  }, zodType);
}

export function addBaseSchemaProperties<T extends OpenAIStructuredOutputSchema>(schema: T, zodType: z.ZodType<any>) {
  return {
    ...schema,
    ...zodType._def.description && { description: zodType._def.description },
  };
}
