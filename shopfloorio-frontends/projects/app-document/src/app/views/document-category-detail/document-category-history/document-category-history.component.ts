import { Component, Input } from '@angular/core';
import { DocumentActivityDto } from 'shared/common/models';

@Component({
  selector: 'app-document-category-history',
  templateUrl: './document-category-history.component.html',
  styleUrls: ['./document-category-history.component.scss'],
})
export class DocumentCategoryHistoryComponent {
  @Input()
  activities: DocumentActivityDto[] = [];
}
