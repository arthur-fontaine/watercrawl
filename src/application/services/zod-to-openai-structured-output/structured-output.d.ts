interface OpenAIStructuredOutput {
  type: 'json_schema';
  json_schema: {
    name: string;
    strict: boolean;
    schema: OpenAIStructuredOutputSchema;
  };
}

type OpenAIStructuredOutputSchema =
  | OpenAIStructuredOutputObjectSchema
  | OpenAIStructuredOutputArraySchema
  | OpenAIStructuredOutputStringSchema
  | OpenAIStructuredOutputNumberSchema;

interface OpenAIStructuredOutputBaseSchema {
  description?: string;
}

interface OpenAIStructuredOutputObjectSchema extends OpenAIStructuredOutputBaseSchema {
  type: 'object';
  properties: Record<string, OpenAIStructuredOutputSchema>;
  required?: string[];
  additionalProperties?: boolean;
}

interface OpenAIStructuredOutputArraySchema extends OpenAIStructuredOutputBaseSchema {
  type: 'array';
  items: OpenAIStructuredOutputSchema;
}

interface OpenAIStructuredOutputStringSchema extends OpenAIStructuredOutputBaseSchema {
  type: 'string';
}

interface OpenAIStructuredOutputNumberSchema extends OpenAIStructuredOutputBaseSchema {
  type: 'number';
}
