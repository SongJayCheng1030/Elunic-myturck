import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MultilangValue } from 'shared/common/models';

@Pipe({
  name: 'multilang',
})
export class MultilangValuePipe implements PipeTransform {
  constructor(private translate: TranslateService) {}

  transform(value: MultilangValue | string): string {
    if (!value || typeof value === 'string') {
      return value || '';
    }
    const { currentLang } = this.translate;
    return value[currentLang] || value['de_DE'] || value['en_EN'];
  }
}
