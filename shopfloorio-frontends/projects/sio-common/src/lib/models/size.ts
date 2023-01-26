export class Size {
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
}

export const defaultThumbnailSize: Size = new Size(128, 128);
