// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function coerceBoolean(value?: any): boolean {
  return [1, '1', true, 'true'].includes(value || '0');
}
