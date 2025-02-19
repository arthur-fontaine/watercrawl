import { expect, test } from 'bun:test'
import { z } from 'zod'

import { zodToOpenAIStructuredOutput } from './index'

test('zodToOpenAIStructuredOutput without description throws', () => {
  const schema = z.object({
    name: z.string(),
  })

  expect(() => zodToOpenAIStructuredOutput(schema)).toThrow('Bad schema description: A description is required')
})

test('zodToOpenAIStructuredOutput with description with more that one word throws', () => {
  const schema = z.object({
    name: z.string(),
  }).describe('A person')

  expect(() => zodToOpenAIStructuredOutput(schema)).toThrow('Bad schema description: Description must be a single word')
})

test('zodToOpenAIStructuredOutput with unsupported zod type throws', () => {
  const schema = z.string().describe('string')

  // @ts-expect-error
  expect(() => zodToOpenAIStructuredOutput(schema)).toThrow('Unsupported Zod type: ZodString')
})

test('zodToOpenAIStructuredOutput', () => {
  const schema = z.object({
    name: z.string(),
    age: z.number(),
    pets: z.array(z.string()),
  }).describe('person').passthrough()

  expect(zodToOpenAIStructuredOutput(schema)).toEqual({
    type: 'json_schema',
    json_schema: {
      name: 'person',
      schema: {
        type: 'object',
        description: 'person',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
          pets: { type: 'array', items: { type: 'string' } },
        },
        required: ['name', 'age', 'pets'],
        additionalProperties: true,
      },
      strict: false,
    },
  })
})

