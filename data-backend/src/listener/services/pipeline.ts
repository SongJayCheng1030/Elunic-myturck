export abstract class Pipeline<TInput, TOutput = unknown> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected abstract canTransform(input: any): input is TInput;
  protected abstract transformData(input: TInput): TOutput;

  transform(input: TInput): TOutput | null {
    if (!this.canTransform(input)) {
      return null;
    }
    return this.transformData(input);
  }
}

export class NoopPipeline<T> extends Pipeline<T, T> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canTransform(input: unknown): input is T {
    return true;
  }

  transformData(input: T): T {
    return input;
  }
}
