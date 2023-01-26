import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'objectValue',
})
export class ObjectValuePipe implements PipeTransform {
  transform(value: Record<string, any>, key: string): Record<string, any> | string {
    if (!key) {
      return value;
    }
    return value[key];
  }
}
