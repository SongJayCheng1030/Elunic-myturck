import { Pipe, PipeTransform } from '@angular/core';

import { environment } from '../services';

@Pipe({
  name: 'iconUrl',
})
export class IconUrlPipe implements PipeTransform {
  transform(value: string, ...args: unknown[]): unknown {
    return IconUrlPipe.do(value);
  }

  static do(fileId: string): string {
    if (fileId) {
      if (fileId.startsWith('assets/')) {
        return fileId;
      }

      if (fileId.includes('http://') || fileId.includes('https://')) {
        return fileId;
      }
      // return `${this.environment.fileServiceUrl}v1/thumbnail/${value}`;
      return `${environment.fileServiceUrl}v1/file/${fileId}`;
    }
    return './assets/images/asset-thumbnail.jpg';
  }
}
