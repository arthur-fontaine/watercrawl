interface Queue<T> {
  add(data: T): Promise<void>;
  process(handler: (data: T) => Promise<unknown>): void;
  onFailed(handler: (data: T, error: Error) => void): void;
}
