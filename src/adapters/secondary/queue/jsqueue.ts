interface JsQueueOptions {
  /**
   * Number of concurrent jobs
   * @example 5
   * @default 1
   */
  concurrency: number;
}

export class JsQueue<T> implements Queue<T> {
  #queue: T[] = [];
  #failureHandlers: ((data: T, error: Error) => void)[] = [];
  #concurrency: number;

  constructor(options: JsQueueOptions = { concurrency: 1 }) {
    this.#concurrency = options.concurrency;
  }

  async add(data: T): Promise<void> {
    this.#queue.push(data);
  }

  async process(handler: (data: T) => Promise<void>): Promise<void> {
    const workers: Promise<void>[] = [];

    for (let i = 0; i < this.#concurrency; i++) {
      workers.push(this.#worker(handler));
    }

    await Promise.all(workers);
  }

  async #worker(handler: (data: T) => Promise<void>): Promise<void> {
    while (true) {
      const data = this.#queue.shift();
      if (data) {
        try {
          await handler(data);
        } catch (error) {
          if (!(error instanceof Error)) {
            throw new TypeError('Caught non-error object');
          }

          this.#failureHandlers.forEach((failureHandler) => {
            failureHandler(data, error);
          });
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 0)); // prevent blocking the event loop
    }
  }

  onFailed(handler: (data: T, error: Error) => void): void {
    this.#failureHandlers.push(handler);
  }
}
