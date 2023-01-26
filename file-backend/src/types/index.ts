/**
 * The internal metadata storage format
 */
export interface FileMetadata {
  id: string;
  originalName: string;
  mime: string;
  size: number;
  iat: number;
  md5: string;

  // TODO - "Owner", but perhaps this shouldn't be in this service at all.
  // iby: string;
}
