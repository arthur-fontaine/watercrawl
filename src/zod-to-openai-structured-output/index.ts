import { z } from 'zod';
import { BadSchemaDescription, UnsupportedZodType } from './errors';
import { getOpenAIType } from './get-open-ai-type';

export function zodToOpenAIStructuredOutput<T extends z.ZodObject<any>>(zodType: T): OpenAIStructuredOutput {
  const name = zodType._def.description;
  if (!name) {
    throw new BadSchemaDescription('A description is required');
  }

  if (name.split(' ').length > 1) {
    throw new BadSchemaDescription('Description must be a single word');
  }

  if (!(zodType instanceof z.ZodObject)) {
    throw new UnsupportedZodType(zodType);
  }

  return {
    type: 'json_schema',
    json_schema: {
      name,
      schema: getOpenAIType(zodType),
      strict: zodType._def.unknownKeys === 'strict',
    },
  };
}
