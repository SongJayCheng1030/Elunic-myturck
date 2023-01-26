import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  EquipmentKpiTypes,
  GroupItemProperty,
  InsightDataKpiService,
  ModalGroupFilterComponent,
  TreeNode,
} from '@sio/common';
import moment from 'moment';
import { AssetTreeNodeDto } from 'shared/common/models';

@Component({
  selector: 'app-oee-monitoring-overview',
  templateUrl: './oee-monitoring-overview.component.html',
  styleUrls: ['./oee-monitoring-overview.component.scss'],
})
export class OeeMonitoringOverviewComponent implements OnInit {
  kpiAssets: AssetTreeNodeDto[] = [];
  assetTreeNode: TreeNode = { id: '' };
  defaultDateRange = {
    from: moment().subtract(1, 'month').startOf('month').toISOString(),
    to: moment().subtract(1, 'month').endOf('month').toISOString(),
  };

  @Input() set treeNode(node: TreeNode) {
    const init = !this.assetTreeNode || !this.assetTreeNode.id ? true : false;
    this.assetTreeNode = node;
    const assets = this.kpiService.findCMAssets(this.assetTreeNode as AssetTreeNodeDto);
    this.kpiAssets = [...assets.conversionAssets, ...assets.equipmentAssets];
    if (!init) this.dateRangeSelected(this.defaultDateRange);
  }

  equipmentGroups: GroupItemProperty[] = [
    {
      id: '',
      name: '12235',
      children: [
        { id: '', name: 'AT 01' },
        { id: '', name: 'AT 02' },
      ],
    },
    {
      id: '',
      name: '14606',
      active: true,
      selected: true,
      children: [
        { id: '', name: 'MT 01', selected: true },
        { id: '', name: 'MT 02', selected: true },
        { id: '', name: 'MT 03', selected: true },
        { id: '', name: 'MT 04', selected: true },
        { id: '', name: 'MT 05', selected: true },
        { id: '', name: 'MT 06', selected: true },
      ],
    },
    {
      id: '',
      name: '14607',
      children: [
        { id: '', name: 'RG 01' },
        { id: '', name: 'RG 02' },
        { id: '', name: 'RG 03' },
      ],
    },
    {
      id: '',
      name: '14608',
      children: [
        { id: '', name: 'YW 01' },
        { id: '', name: 'YW 02' },
        { id: '', name: 'YW 03' },
      ],
    },
    {
      id: '',
      name: '14609',
      children: [
        { id: '', name: 'EE 01' },
        { id: '', name: 'EE 02' },
        { id: '', name: 'EE 03' },
      ],
    },
    {
      id: '',
      name: '14610',
      children: [
        { id: '', name: 'OP 01' },
        { id: '', name: 'OP 02' },
        { id: '', name: 'OP 03' },
      ],
    },
  ];
  conversionKitGroups: GroupItemProperty[] = [
    {
      id: '',
      name: '12235',
      children: [
        { id: '', name: 'AT 01' },
        { id: '', name: 'AT 02' },
      ],
    },
    {
      id: '',
      name: '14606',
      active: true,
      children: [
        { id: '', name: 'MT 01' },
        { id: '', name: 'MT 02' },
      ],
    },
  ];
  allKpiValues = Object.values(EquipmentKpiTypes);

  constructor(
    private readonly kpiService: InsightDataKpiService,
    private readonly modalService: NgbModal,
  ) {}

  ngOnInit(): void {}

  setSelectedKpi(kpi: EquipmentKpiTypes) {
    this.kpiService.getSelectedKpiSubject().next(kpi);
  }

  getSelectedKpiSubject() {
    return this.kpiService.getSelectedKpiSubject();
  }

  dateRangeSelected(range: any) {
    this.defaultDateRange = range;
    this.kpiService.initOverviewByNode(
      this.assetTreeNode as AssetTreeNodeDto,
      range.from,
      range.to,
    );
  }

  getFilterCount(groups: GroupItemProperty[]) {
    if (groups) {
      return groups.filter(group => group.selected).length;
    }
    return null;
  }

  async onEquipmentFilter(): Promise<void> {
    const result = await this.equipmentFilterModal(this.equipmentGroups);
    if (result) {
      this.equipmentGroups = result;
    }
  }

  async onConversionKitFilter(): Promise<void> {
    const result = await this.conversionKitFilterModal(this.conversionKitGroups);
    if (result) {
      this.conversionKitGroups = result;
    }
  }

  private equipmentFilterModal(
    groupItems: GroupItemProperty[],
  ): Promise<GroupItemProperty[] | null> {
    const modal = this.modalService.open(ModalGroupFilterComponent, {
      centered: true,
      size: 'lg',
      backdrop: 'static',
    });
    modal.componentInstance.content = {
      title: 'MODALS.GROUP_FILTER.SELECT_EQUIPMENT',
      group: 'MODALS.GROUP_FILTER.EQUIPMENT_GROUP',
      item: 'MODALS.GROUP_FILTER.EQUIPMENT',
    };
    modal.componentInstance.groupItems = groupItems;
    return modal.result;
  }

  private conversionKitFilterModal(
    groupItems: GroupItemProperty[],
  ): Promise<GroupItemProperty[] | null> {
    const modal = this.modalService.open(ModalGroupFilterComponent, {
      centered: true,
      size: 'lg',
      backdrop: 'static',
    });
    modal.componentInstance.content = {
      title: 'MODALS.GROUP_FILTER.SELECT_CONVERSION_KIT',
      group: 'MODALS.GROUP_FILTER.CONVERSION_KIT_GROUP',
      item: 'MODALS.GROUP_FILTER.CONVERSION_KIT',
    };
    modal.componentInstance.groupItems = groupItems;
    return modal.result;
  }
}
