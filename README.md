<h1 align="center">
  💧 Watercrawl
</h1>

<p align="center">
  <strong>Watercrawl</strong> is an AI-powered web crawler/scraper designed to be <u>simple</u> and to be used with the tools <u>YOU</u> want to use.
</p>

## 🚀 Quick start in 5 minutes!

With Watercrawl, you can start crawling and scraping a website in just **<u>few minutes</u>**!

1. Install Watercrawl.

    ```sh
    bun i -g watercrawl
    ```

2. Create a flow file.

    ```ts
    // flow.ts

    import { appendFileSync } from "fs"
    import { createFlow, z } from "watercrawl"
    import { BullQueue } from "watercrawl/queues"
    import { FetchBrowser } from "watercrawl/browsers"
    import { OpenAI } from "watercrawl/ais"

    export const queue = new BullQueue({
      name: 'YOUR_QUEUE_NAME',
      concurrency: 5,
      redis: {
        host: 'localhost',
        port: 6379,
      },
      dashboard: {
        enable: true,
        port: 3000,
      },
    })
    export const browser = new FetchBrowser()
    export const ai = new MultiAI([
      new OpenAI({
        model: 'google/gemini-2.0-pro-exp-02-05:free',
        apiKey: Bun.env.OPENROUTER_API_KEY, // In Bun, .env files are automatically loaded
        baseUrl: 'https://openrouter.ai/api/v1'
      }),
      // If the above AI fails, try this AI
      new OpenAI({
        model: 'gemini-2.0-pro-exp',
        apiKey: Bun.env.GEMINI_API_KEY,
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai'
      }),
      // If the above AI fails, try this AI
      new OpenAI({
        model: 'gemini-2.0-flash',
        apiKey: Bun.env.GEMINI_API_KEY,
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai'
      }),
    ])

    export default createFlow({
      schema: z.object({
        url: z.string().url(),
        name: z.string(),
        otherLinks: z.array(z.string()),
      }).describe('YOUR_ENTITY').strict(),
      then({ otherLinks, ...data }, addToQueue) {
        addToQueue(...otherLinks)
        appendFileSync('results.jsonl', JSON.stringify(data) + '\n')
      },
    })
    ```

    > [!NOTE]
    > You can use any OpenAI compatible API like OpenAI itself, [Ollama](https://ollama.com/), [Google AI Studio](https://aistudio.google.com/), [OpenRouter](https://openrouter.ai/), etc.

3. Run the flow.

    ```sh
    # Start a Redis server
    docker run -p 6379:6379 -d redis

    # Run the flow
    watercrawl flow YOUR_ENTRYPOINT_URL
    ```

4. Check the results in `results.jsonl` or in the dashboard at `http://localhost:3000/ui`.

## 📦 Tools

### 🌐 Browsers

- [FetchBrowser](/src/adapters/secondary/browser/fetch.ts): Fetches the page using `fetch`.

  ```ts
  // flow.ts

  import { FetchBrowser } from "watercrawl/browsers"

  export const browser = new FetchBrowser({
    /* optional */
    requestOptions: {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
      },
    },
  })
  ```

- [PuppeteerBrowser](/src/adapters/secondary/browser/puppeteer.ts): Fetches the page using [Puppeteer](https://pptr.dev/).
  
  ```ts
  // flow.ts

  import { PuppeteerBrowser } from "watercrawl/browsers"

  export const browser = new PuppeteerBrowser({
    /* required */
    browserWSEndpoint: 'ws://localhost:3000',
  })
  ```

  <details>
    <summary><b>Run Puppeteer</b></summary>

  - **With Lightpanda**:

      Check <https://github.com/lightpanda-io/browser> for more information.

  - **With Puppeteer**:

      ```ts
      // In your flow file

      import puppeteer from 'puppeteer'

      const puppeteerInstance = await puppeteer.launch({
        headless: true,
        args: [
          '--disable-gpu',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ],
      })
      ```

      Use `puppeteerInstance.wsEndpoint()` for the `browserWSEndpoint`.

  - **With your own Chrome instance**:

      ```sh
      # On macOS
      /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
      ```

      Get the `ws://` endpoint from the console.

  </details>

- [HappyDomBrowser](/src/adapters/secondary/browser/happy-dom.ts): Fetches the page using `fetch` and parses the HTML using [Happy DOM](https://github.com/capricorn86/happy-dom).

  ```ts
  // flow.ts

  import { HappyDomBrowser } from "watercrawl/browsers"

  export const browser = new HappyDomBrowser({
    /* required */
    selectors: ['html'],

    /* optional */
    requestOptions: {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
      },
    },
  })
  ```

### 🧠 AIs

- [OpenAI](/src/adapters/secondary/ai/openai.ts): Uses the OpenAI API to generate text.

  ```ts
  // flow.ts

  import { OpenAI } from "watercrawl/ais"

  // Use any OpenAI compatible API
  export const ai = new OpenAI({
    /* required */
    model: 'YOUR_MODEL',
    baseUrl: 'YOUR_BASE_URL',
    /* optional */
    apiKey: 'YOUR_API_KEY',
  })
  ```

- [MultiAI](/src/adapters/secondary/ai/multi.ts): If an AI fails, it retries with another AI.

  ```ts
  // flow.ts

  import { MultiAI } from "watercrawl/ais"

  export const ai = new MultiAI([
    // try this AI first
    new OpenAI({
      model: 'YOUR_MODEL_1',
      baseUrl: 'YOUR_BASE_URL_1',
      apiKey: 'YOUR_API_KEY_1',
    }),
    // if the above AI fails, try this AI
    new OpenAI({
      model: 'YOUR_MODEL_2',
      baseUrl: 'YOUR_BASE_URL_2',
      apiKey: 'YOUR_API_KEY_2',
    }),
  ])
  ```

### ⏳ Queues

- [BullQueue](/src/adapters/secondary/queue/bull.ts): Uses [Bull](https://github.com/OptimalBits/bull) as the queue.

  ```ts
  // flow.ts

  import { BullQueue } from "watercrawl/queues"

  export const queue = new BullQueue({
    /* required */
    name: 'YOUR_QUEUE_NAME',
    redis: {
      host: 'localhost',
      port: 6379,
    },
    /* optional */
    concurrency: 5,
    dashboard: {
      enable: true,
      port: 3000,
    },
  })
  ```

- [JsQueue](/src/adapters/secondary/queue/jsqueue.ts): Uses an in-memory queue.

  ```ts
  // flow.ts

  import { JsQueue } from "watercrawl/queues"

  export const queue = new JsQueue({
    /* required */
    concurrency: 5,
  })
  ```

### 🎨 Implement your owns

- [Browser](/src/domain/ports/browser.d.ts)
  
  ```ts
  import type { Browser } from "watercrawl"

  export class MyBrowser implements Browser {
    // Implement the methods
  }

  // Then, instantiate it in your flow file and export it as `browser`
  ```

- [AI](/src/domain/ports/ai.d.ts)
  
  ```ts
  import type { AI } from "watercrawl"

  export class MyAI implements AI {
    // Implement the methods
  }

  // Then, instantiate it in your flow file and export it as `ai`
  ```

- [Queue](/src/domain/ports/queue.d.ts)
  
  ```ts
  import type { Queue } from "watercrawl"

  export class MyQueue<T> implements Queue<T> {
    // Implement the methods
  }

  // Then, instantiate it in your flow file and export it as `queue`
  ```

## 💡 Tips

- Add `.describe('A description')` to your schema properties. This will help AI models understand what information it should get from the page.
- Gemini models seem to be ideal as they can take big inputs. You can use [OpenRouter](https://openrouter.ai/) to use them for free (as of 1st March 2025).
- Make sure the model you're using supports `response_format` and `structured_outputs`. You can use the Models page on [OpenRouter](https://openrouter.ai/models) to filter models that support these.
- Use `HappyDomBrowser` to pre-select the elements you want to scrape. You can reduce the input size for the AI by doing this.
- If the website is static, you probably want to use `FetchBrowser` or `HappyDomBrowser`. If it's dynamic, you probably want to use `PuppeteerBrowser`.
- You can combine multiple AIs using `MultiAI` to prevent quota limits. Personally, I use:
  - OpenRouter which is limited to 200 free requests per day.
  - Google AI Studio which has different limits according to the model used (i.e., 50 free requests per day for `google/gemini-2.0-pro-exp` and 1500 free requests per day for `google/gemini-2.0-flash` as of 1st March 2025). You can get an API key for free at <https://aistudio.google.com/apikey>. Their API is compatible with OpenAI (see [OpenAI compatibility](https://ai.google.dev/gemini-api/docs/openai#rest)), so you can use `https://generativelanguage.googleapis.com/v1beta/openai` as the base URL.
  - Fallback to local Ollama (which is slower according to your computer's performance) if all the above fail.
