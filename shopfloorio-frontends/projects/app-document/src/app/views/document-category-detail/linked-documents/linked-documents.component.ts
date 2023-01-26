import { Component, Input } from '@angular/core';
import { DocumentDto } from 'shared/common/models';

@Component({
  selector: 'app-linked-documents',
  templateUrl: './linked-documents.component.html',
  styleUrls: ['./linked-documents.component.scss'],
})
export class LinkedDocumentsComponent {
  @Input()
  documents: DocumentDto[] = [];
}
