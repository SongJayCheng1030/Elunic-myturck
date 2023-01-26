import { ArrayDataSource, SelectionModel } from '@angular/cdk/collections';
import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AssetTreeNodeDto } from 'shared/common/models';

export interface ModalAssignMaintenancePlanContent {
  assetTrees: AssetTreeNodeDto[];
  selectable: string[];
  selected: string[];
}

@Component({
  selector: 'app-modal-assign-maintenance-plan',
  templateUrl: './modal-assign-maintenance-plan.component.html',
  styleUrls: ['./modal-assign-maintenance-plan.component.scss'],
})
export class ModalAssignMaintenancePlanComponent implements OnInit {
  content!: ModalAssignMaintenancePlanContent;
  treeControl = new NestedTreeControl<AssetTreeNodeDto>(node => node.children);
  dataSource = new ArrayDataSource<AssetTreeNodeDto>([]);
  selectedAssetIds = new SelectionModel<string>(true, []);

  constructor(private modal: NgbActiveModal) {}

  ngOnInit(): void {
    this.dataSource = new ArrayDataSource(this.content.assetTrees);
    this.selectedAssetIds = new SelectionModel<string>(true, this.content.selected);
    this.treeControl.dataNodes = this.content.assetTrees;
    this.treeControl.expandAll();
  }

  close(): void {
    this.modal.close(null);
  }

  onSubmit(): void {
    this.modal.close(this.selectedAssetIds.selected);
  }

  hasChild = (_: number, node: AssetTreeNodeDto) => !!node.children && node.children.length > 0;
}
