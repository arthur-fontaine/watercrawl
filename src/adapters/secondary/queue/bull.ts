import { createBullBoard } from "@bull-board/api";
import { HonoAdapter } from "@bull-board/hono";
import Bull from "bull";
import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { BullAdapter } from "@bull-board/api/bullAdapter";
import { serve } from "bun";

interface BullQueueOptions {
  /**
   * Queue name
   * @example "my-queue"
   */
  name: string;
  /**
   * Redis connection options
   * @example { host: 'localhost', port: 6379 }
   */
  redis: {
    host: string;
    port: number;
  };
  /**
   * Number of concurrent jobs
   * @example 5
   * @default 1
   */
  concurrency?: number;
  /**
   * Dashboard options
   * @example { enable: true, port: 3000 }
   * @default undefined
   */
  dashboard?: {
    enable: true;
    /**
     * The port the dashboard will be accessible at
     * @example 3000
     */
    port: number;
  };
}

export class BullQueue<T> implements Queue<T> {
  #queue: Bull.Queue<T>;
  #options: BullQueueOptions;

  constructor(options: BullQueueOptions) {
    this.#options = options;
    this.#queue = new Bull<T>(options.name, {
      redis: options.redis,
    });

    if (options.dashboard) {
      this.#startDashboard(options.dashboard);
    }
  }

  async add(jobData: T): Promise<void> {
    await this.#queue.add(jobData);
  }

  process(processor: (data: T) => Promise<unknown>): void {
    this.#queue.process(this.#options.concurrency ?? 1, async (job) => {
      return await processor(job.data);
    });
  }

  onFailed(callback: (data: T, err: Error) => void): void {
    this.#queue.on('failed', (job, err) => {
      callback(job.data, err);
    });
  }

  #startDashboard(options: NonNullable<BullQueueOptions['dashboard']>): void {
    const app = new Hono();

    const serverAdapter = new HonoAdapter(serveStatic);

    createBullBoard({
      queues: [new BullAdapter(this.#queue)],
      serverAdapter,
    });

    const basePath = '/ui'
    serverAdapter.setBasePath(basePath);
    app.route(basePath, serverAdapter.registerPlugin());

    console.log(`Bull dashboard is running at http://localhost:${options.port}${basePath}`);

    serve({ fetch: app.fetch, port: options.port });
  }
}
