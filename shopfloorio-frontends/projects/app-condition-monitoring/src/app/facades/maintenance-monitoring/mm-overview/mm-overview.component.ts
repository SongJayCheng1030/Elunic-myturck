import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GroupItemProperty, ModalGroupFilterComponent, SidebarService } from '@sio/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';

@Component({
  selector: 'app-mm-overview',
  templateUrl: './mm-overview.component.html',
  styleUrls: ['./mm-overview.component.scss'],
})
export class MmOverviewComponent implements OnInit, OnDestroy {
  equipments = [
    {
      id: '16123160-3215-4a9d-9be1-833ae90625d6',
      name: 'MT 99 XX 00',
      kitType: 'QFP',
      status: 'critical',
      icon: 'alarm',
      backgroundColor: '#f0484f',
    },
    {
      id: '16123160-3215-4a9d-9be1-833ae90625d6',
      name: 'MT 99 XX 00',
      kitType: 'QFP',
      status: 'critical',
      icon: 'alarm',
      backgroundColor: '#f0484f',
    },
    {
      id: '16123160-3215-4a9d-9be1-833ae90625d6',
      name: 'MT 99 XX 00',
      kitType: 'QFP',
      status: 'critical',
      icon: 'alarm',
      backgroundColor: '#f0484f',
    },
    {
      id: '16123160-3215-4a9d-9be1-833ae90625d6',
      name: 'MT 99 XX 00',
      kitType: 'QFP',
      status: 'critical',
      icon: 'alarm',
      backgroundColor: '#f0484f',
    },
    {
      id: '16123160-3215-4a9d-9be1-833ae90625d6',
      name: 'MT 99 XX 00',
      kitType: 'QFP',
      status: 'degrading',
      icon: 'down',
      backgroundColor: '#f57100',
    },
    {
      id: '16123160-3215-4a9d-9be1-833ae90625d6',
      name: 'MT 99 XX 00',
      kitType: 'QFP',
      status: 'warning',
      icon: 'warning',
      backgroundColor: '#fcc83d',
    },
    {
      id: '16123160-3215-4a9d-9be1-833ae90625d6',
      name: 'MT 99 XX 00',
      kitType: 'QFP',
      status: 'warning',
      icon: 'warning',
      backgroundColor: '#fcc83d',
    },
    {
      id: '16123160-3215-4a9d-9be1-833ae90625d6',
      name: 'MT 99 XX 00',
      kitType: 'QFP',
      status: 'warning',
      icon: 'warning',
      backgroundColor: '#fcc83d',
    },
    {
      id: '16123160-3215-4a9d-9be1-833ae90625d6',
      name: 'MT 99 XX 00',
      kitType: 'QFP',
      status: 'warning',
      icon: 'warning',
      backgroundColor: '#fcc83d',
    },
    {
      id: '16123160-3215-4a9d-9be1-833ae90625d6',
      name: 'MT 99 XX 00',
      kitType: 'QFP',
      status: 'good',
    },
    {
      id: '16123160-3215-4a9d-9be1-833ae90625d6',
      name: 'MT 99 XX 00',
      kitType: 'QFP',
      status: 'good',
    },
    {
      id: '16123160-3215-4a9d-9be1-833ae90625d6',
      name: 'MT 99 XX 00',
      kitType: 'QFP',
      status: 'good',
    },
  ];
  equipmentGroups: GroupItemProperty[] = [
    {
      id: uuid(),
      name: '12235',
      children: [
        { id: uuid(), name: 'AT 01' },
        { id: uuid(), name: 'AT 02' },
      ],
    },
    {
      id: uuid(),
      name: '14606',
      active: true,
      selected: true,
      children: [
        { id: uuid(), name: 'MT 01', selected: true },
        { id: uuid(), name: 'MT 02', selected: true },
        { id: uuid(), name: 'MT 03', selected: true },
        { id: uuid(), name: 'MT 04', selected: true },
        { id: uuid(), name: 'MT 05', selected: true },
        { id: uuid(), name: 'MT 06', selected: true },
      ],
    },
    {
      id: uuid(),
      name: '14607',
      children: [
        { id: uuid(), name: 'RG 01' },
        { id: uuid(), name: 'RG 02' },
        { id: uuid(), name: 'RG 03' },
      ],
    },
    {
      id: uuid(),
      name: '14608',
      children: [
        { id: uuid(), name: 'YW 01' },
        { id: uuid(), name: 'YW 02' },
        { id: uuid(), name: 'YW 03' },
      ],
    },
    {
      id: uuid(),
      name: '14609',
      children: [
        { id: uuid(), name: 'EE 01' },
        { id: uuid(), name: 'EE 02' },
        { id: uuid(), name: 'EE 03' },
      ],
    },
    {
      id: uuid(),
      name: '14610',
      children: [
        { id: uuid(), name: 'OP 01' },
        { id: uuid(), name: 'OP 02' },
        { id: uuid(), name: 'OP 03' },
      ],
    },
  ];
  conversionKitGroups: GroupItemProperty[] = [
    {
      id: uuid(),
      name: '12235',
      children: [
        { id: uuid(), name: 'AT 01' },
        { id: uuid(), name: 'AT 02' },
      ],
    },
    {
      id: uuid(),
      name: '14606',
      active: true,
      children: [
        { id: uuid(), name: 'MT 01' },
        { id: uuid(), name: 'MT 02' },
      ],
    },
  ];
  unsubscribe = new Subject<void>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private modalService: NgbModal,
    private sidebarService: SidebarService,
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
      if (!params.id) {
        this.sidebarService.emitEvent({ select: { root: true } });
      } else {
        this.sidebarService.emitEvent({ select: { node: { id: params.id }, silent: true } });
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
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
