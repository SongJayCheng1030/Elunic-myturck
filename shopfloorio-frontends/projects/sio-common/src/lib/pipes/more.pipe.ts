import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MultilangValue } from 'shared/common/models';

@Pipe({
  name: 'more',
})
export class MorePipe implements PipeTransform {
  constructor(private translateService: TranslateService) {}

  transform<T extends object>(items: T[], max: number, fn: (item: T) => MultilangValue): string {
    const joinedStr = items
      .slice(0, max)
      .map(item => this.translate(fn(item)))
      .join(', ');

    return joinedStr + (items.length > max ? ', ...' : '');
  }

  translate(value: MultilangValue): string {
    const { defaultLang } = this.translateService;

    if (!value || !Object.keys(value).length) {
      return '';
    }

    if (value[defaultLang]) {
      return value[defaultLang];
    }

    const keys = Object.keys(value);

    for (const key of keys) {
      if (key === 'translate') {
        return this.translateService.instant(value[key]);
      }
      if (key.toLowerCase().startsWith(defaultLang.toLowerCase())) {
        return value[key];
      }
    }
    return value[keys[0]];
  }
}
