import Bull from "bull";

interface BullQueueOptions {
  name: string;
  redisHost: string;
  redisPort: number;
}

export class BullQueue<T> implements Queue<T> {
  queue: Bull.Queue<T>;

  constructor(options: BullQueueOptions) {
    const { name, redisHost, redisPort } = options;
    this.queue = new Bull<T>(name, {
      redis: {
        host: redisHost,
        port: redisPort,
      },
    });
  }

  async add(jobData: T): Promise<void> {
    await this.queue.add(jobData);
  }

  process(processor: (data: T) => Promise<void>): void {
    this.queue.process(async (job) => {
      await processor(job.data);
    });
  }

  onCompleted(callback: (job: Bull.Job<T>, result: any) => void): void {
    this.queue.on('completed', callback);
  }

  onFailed(callback: (data: T, err: Error) => void): void {
    this.queue.on('failed', callback);
  }
}
