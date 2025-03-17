interface Queue<T, O = unknown> {
  add(data: T): Promise<void>;
  process(handler: (data: T) => Promise<O>): void;
  onFailed(handler: (data: T, error: Error) => void): void;
}
