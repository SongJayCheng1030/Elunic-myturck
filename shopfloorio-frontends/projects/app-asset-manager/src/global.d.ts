export {};

declare global {
  interface Window {
    env: {
      [key: string]: string;
    };
  }

  type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;
}
