import { createHash } from 'crypto';

export * from './rights';

/**
 * Function that maps a right key to a UUID
 *
 * @param GeneralRights The right key to map
 * @returns The mapped UUID
 */
export function mapRightKeyToUUID(rightKey: string): string {
  const shasum = createHash('sha1')
    .update(rightKey || '')
    .digest('hex')
    .toLowerCase();
  return [
    shasum.substring(0, 8),
    shasum.substring(8, 12),
    shasum.substring(12, 16),
    shasum.substring(16, 20),
    shasum.substring(20),
  ]
    .join('-')
    .substring(0, 36);
}
