import { expect, test } from 'bun:test'
import { MultiAI } from './multi'

test('MultiAI should use the second AI if the first AI fails', async () => {
  const multiAI = new MultiAI([
    {
      async completions() { throw new Error('First AI failed') }
    },
    {
      async completions() { return { choices: [{ message: { content: 'Second AI response' } }] } },
    },
  ])

  const response = await multiAI.completions({ messages: [] })

  expect(response).toEqual({ choices: [{ message: { content: 'Second AI response' } }] })
})
