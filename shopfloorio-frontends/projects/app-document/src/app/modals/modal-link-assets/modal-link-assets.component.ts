import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AssetDto, DocumentLinkDto } from 'shared/common/models';

interface ModalLinkAssetsContent {
  assets: AssetDto[];
  links: DocumentLinkDto[];
}

export interface ModalLinkAssetsResult {
  added: string[];
  removed: string[];
}

@Component({
  selector: 'app-modal-link-assets',
  templateUrl: './modal-link-assets.component.html',
  styleUrls: ['./modal-link-assets.component.scss'],
})
export class ModalLinkAssetsComponent implements OnInit {
  content!: ModalLinkAssetsContent;

  selectedIds: string[] = [];

  constructor(private modal: NgbActiveModal) {}

  ngOnInit(): void {
    this.selectedIds = this.content.links.map(l => l.refId);
  }

  onSelect(index: number, selected: boolean): void {
    const asset = this.content.assets[index];
    if (selected) {
      this.selectedIds = [...this.selectedIds, asset.id];
    } else {
      this.selectedIds = this.selectedIds.filter(id => id !== asset.id);
    }
  }

  close(): void {
    this.modal.close();
  }

  confirm() {
    const added = this.selectedIds.filter(id => !this.content.links.some(l => l.refId === id));
    const removed = this.content.links
      .filter(link => !this.selectedIds.includes(link.refId))
      .map(link => link.refId);
    const result: ModalLinkAssetsResult = { added, removed };
    this.modal.close(result);
  }
}
