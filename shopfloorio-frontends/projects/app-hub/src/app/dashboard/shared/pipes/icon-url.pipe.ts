import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '@sio/common';

@Pipe({
  name: 'iconUrl',
})
export class IconUrlPipe implements PipeTransform {
  transform(value: string, ...args: string[]): unknown {
    if (value) {
      if (value.includes('http://') || value.includes('https://')) {
        return value;
      }
      return `${environment.fileServiceUrl}/v1/file/${value}`;
    }
    if (args.includes('noStubImg')) {
      return '';
    }
    return 'assets/no-image.png';
  }
}
