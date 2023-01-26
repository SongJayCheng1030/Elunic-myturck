import { Pipe, PipeTransform } from '@angular/core';
import { orderBy } from 'lodash';

export interface SortOptions {
  property: string;
  direction: 'asc' | 'desc';
}

@Pipe({
  name: 'sortBy',
})
export class SortByPipe implements PipeTransform {
  transform<T extends object>(items: T[], options: SortOptions | null): T[] {
    if (!options?.property || items.length < 2) {
      return items;
    }

    return orderBy(items, options.property, options.direction);
  }
}
