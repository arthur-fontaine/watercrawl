# watercrawl

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.2.1. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## Testing

To run tests, create a `.env.test.local` file with the following content:

```
OPENROUTER_API_KEY=your_openrouter_api_key
```

Then run:

```bash
bun test
```

## Running

To run the project, create a `.env.local` file with the following content:

```env
OPENAI_BASE_URL=https://openrouter.ai/api
OPENAI_API_KEY=your_openrouter_api_key
OPENAI_MODEL=google/gemini-2.0-pro-exp-02-05:free
```

> [!INFOS]
> You can use any other API that is compatible with the OpenAI API.

Create a `schema.ts` file with the following content:

```ts
import { z } from 'zod';

export default z.object({
// your schema here
});
```

Then run:

```bash
bun src/cli scrape your_url
```
