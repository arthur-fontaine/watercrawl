interface Queue<T> {
  add(data: T): Promise<void>;
  process(handler: (data: T) => Promise<void>): void;
  onFailed(handler: (data: T, error: Error) => void): void;
}
