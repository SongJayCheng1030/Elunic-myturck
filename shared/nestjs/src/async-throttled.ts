/**
 * See: https://stackoverflow.com/a/57599885
 */

export async function forEachAsync<T>(
  array: T[],
  callback: (ele: T, idx: number, all: T[]) => void,
) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

function splitArrayToBatches<T>(arr: T[], n: number): T[][] {
  const res: T[][] = [];
  while (arr.length) {
    res.push(arr.splice(0, n));
  }
  return res;
}

export async function delayAsync(t = 200): Promise<number> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(t);
    }, t);
  });
}

export async function asnycMapThrottled<T, U>(
  asyncFunction: (item: T) => Promise<U>,
  items: T[] = [],
  batchSize = 1,
  delay = 0,
): Promise<U[]> {
  if (!items || !Array.isArray(items) || items.length < 1) {
    return [];
  }

  return new Promise<U[]>(async (resolve, reject) => {
    const output: U[] = [];
    const batches = splitArrayToBatches(items, batchSize);
    await forEachAsync(batches, async batch => {
      const promises = batch.map(asyncFunction).map(p => p.catch(reject));
      const results = (await Promise.all(promises)) as U[];
      output.push(...results);
      await delayAsync(delay);
    });
    resolve(output);
  });
}
