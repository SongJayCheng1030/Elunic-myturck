import { Component, ContentChild, Input, TrackByFunction } from '@angular/core';

import { TableDirective } from './table';
import { DataRowDefDirective, EmptyRowDefDirective, HeaderRowDefDirective } from './table-row';

@Component({
  selector: 'lib-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  providers: [{ provide: TableDirective, useExisting: TableComponent }],
})
export class TableComponent<T> extends TableDirective<T> {
  @Input() data: T[] = [];
  @Input() trackBy: TrackByFunction<T> = i => i;

  @ContentChild(DataRowDefDirective) dataRow!: DataRowDefDirective<T>;
  @ContentChild(EmptyRowDefDirective) emptyRow?: EmptyRowDefDirective;
  @ContentChild(HeaderRowDefDirective) headerRow?: HeaderRowDefDirective;
}
