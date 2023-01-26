import { Component, Input } from '@angular/core';
import { DocumentActivityDto } from 'shared/common/models';

@Component({
  selector: 'app-document-history',
  templateUrl: './document-history.component.html',
  styleUrls: ['./document-history.component.scss'],
})
export class DocumentHistoryComponent {
  @Input()
  activities: DocumentActivityDto[] = [];
}
