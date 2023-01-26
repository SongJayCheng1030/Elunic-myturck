import { Pipe, PipeTransform } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Pipe({
  name: 'filter',
})
export class FilterPipe implements PipeTransform {
  transform(
    items: object[],
    searchTerm: string,
    props: string[],
    counter$?: BehaviorSubject<number>,
  ): object[] {
    const filteredItems = !props.length
      ? items
      : items.filter(item => FilterPipe.filterItemBySearchTerm(item, props, searchTerm));

    if (counter$ && filteredItems && counter$.value !== filteredItems.length) {
      // Trigger change detection
      setTimeout(() => counter$.next(filteredItems.length));
    }
    return filteredItems;
  }

  static filterItemBySearchTerm(item: object, props: string[], searchTerm: string): boolean {
    return props.some(prop => {
      const property = prop
        .split('.')
        .reduce<string | object>((acc, cur) => acc[cur as keyof object], item);

      if (typeof property !== 'string') {
        return false;
      }

      return property.toLowerCase().startsWith(searchTerm.toLowerCase());
    });
  }
}
