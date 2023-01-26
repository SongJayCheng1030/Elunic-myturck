import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { cloneDeep } from 'lodash';

import { GroupItemProperty } from '../../models';

interface ModalGroupFilterContent {
  title: string;
  group: string;
  item: string;
  selectAll: string;
  deselectAll: string;
  confirm: string;
}

@Component({
  selector: 'app-modal-group-filter',
  templateUrl: './modal-group-filter.component.html',
  styleUrls: ['./modal-group-filter.component.scss'],
})
export class ModalGroupFilterComponent implements OnInit {
  content!: ModalGroupFilterContent;
  groupItems!: GroupItemProperty[];

  groups!: GroupItemProperty[];
  items!: GroupItemProperty[];
  activeGroup?: GroupItemProperty | null;
  allSelected = false;

  constructor(private modal: NgbActiveModal) {}

  ngOnInit() {
    this.groups = cloneDeep(this.groupItems);
    this.activeGroup = this.groups?.find(group => group.active);
    this.allSelected = this.groups?.filter(group => group.selected).length === this.groups?.length;
  }

  close(): void {
    this.modal.close(null);
  }

  onSubmit(): void {
    this.modal.close(this.groups);
  }

  toggleSelectAll() {
    this.allSelected = !this.allSelected;
    if (this.groups) {
      this.groups.forEach(group => this.selectItems(group, this.allSelected));
    }
  }

  selectItems(group: GroupItemProperty, selected: boolean) {
    if (group) {
      group.selected = selected;
      if (group.children) {
        group.children.forEach(child => (child.selected = selected));
      }
    }
  }

  onGroupChange(group: GroupItemProperty, selected: boolean) {
    this.selectItems(group, selected);
  }

  onItemChange() {
    if (this.activeGroup) {
      this.activeGroup.selected = this.activeGroup.children?.find(child => child.selected)
        ? true
        : false;
    }
  }

  onGroup(selectedGroup: GroupItemProperty) {
    this.activeGroup = null;
    if (this.groups) {
      this.groups.forEach(group => (group.active = false));
    }
    selectedGroup.active = true;
    this.activeGroup = selectedGroup;
  }

  get selectedTitle() {
    let title = '';
    if (this.groups) {
      this.groups.forEach(group => {
        if (group.selected) {
          title += title ? ', ' : '';
          const selectedNames =
            group.children?.filter(child => child.selected).map(child => child.name) || [];
          title += `${group.name} (${selectedNames.join(', ')})`;
        }
      });
    }
    return title;
  }
}
