import { expect, test } from "bun:test"

import {
  getOpenAIType,
  getOpenAIArraySchema,
  getOpenAINumberSchema,
  getOpenAIObjectSchema,
  getOpenAIStringSchema
} from "./get-open-ai-type"
import { z } from "zod";

test('z.ZodNumber', () => {
  expect(getOpenAINumberSchema(z.number())).toEqual({
    type: 'number',
  });
});

test('z.ZodNumber with description', () => {
  expect(getOpenAINumberSchema(z.number().describe('A number'))).toEqual({
    type: 'number',
    description: 'A number',
  });
});

test('z.ZodString', () => {
  expect(getOpenAIStringSchema(z.string())).toEqual({
    type: 'string',
  });
});

test('z.ZodObject', () => {
  expect(getOpenAIObjectSchema(z.object({
    name: z.string(),
    age: z.number(),
  }))).toEqual({
    type: 'object',
    properties: {
      name: { type: 'string' },
      age: { type: 'number' },
    },
    required: ['name', 'age'],
    additionalProperties: true,
  });
});

test('z.ZodObject with optional property', () => {
  expect(getOpenAIObjectSchema(z.object({
    name: z.string(),
    age: z.number().optional(),
  }))).toEqual({
    type: 'object',
    properties: {
      name: { type: 'string' },
      age: { type: 'number' },
    },
    required: ['name'],
    additionalProperties: true,
  });
});

test('z.ZodObject with additional properties', () => {
  expect(getOpenAIObjectSchema(z.object({
    name: z.string(),
  }).passthrough())).toEqual({
    type: 'object',
    properties: {
      name: { type: 'string' },
    },
    additionalProperties: true,
    required: ['name'],
  });
});

test('z.ZodObject with strict (no additional properties)', () => {
  expect(getOpenAIObjectSchema(z.object({
    name: z.string(),
  }).strict())).toEqual({
    type: 'object',
    properties: {
      name: { type: 'string' },
    },
    additionalProperties: false,
    required: ['name'],
  });
});

test('z.ZodArray', () => {
  expect(getOpenAIArraySchema(z.array(z.number()))).toEqual({
    type: 'array',
    items: { type: 'number' },
  });
});

test('z.ZodArray with z.ZodObject', () => {
  expect(getOpenAIArraySchema(z.array(z.object({
    name: z.string(),
    age: z.number(),
  })))).toEqual({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
      },
      required: ['name', 'age'],
      additionalProperties: true,
    },
  });
});

test('getOpenAIType with unsupported type', () => {
  expect(() => getOpenAIType(z.union([z.string(), z.number()]))).toThrowError('Unsupported Zod type: ZodUnion');
});
