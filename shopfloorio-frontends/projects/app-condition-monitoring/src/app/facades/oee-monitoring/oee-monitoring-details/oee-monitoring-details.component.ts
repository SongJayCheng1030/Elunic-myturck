import { Component, Input, OnInit } from '@angular/core';
import { InsightDataKpiService, SidebarService, TreeNode } from '@sio/common';
import moment from 'moment';

@Component({
  selector: 'app-oee-monitoring-details',
  templateUrl: './oee-monitoring-details.component.html',
  styleUrls: ['./oee-monitoring-details.component.scss'],
})
export class OeeMonitoringDetailsComponent implements OnInit {
  activeNode?: any;
  currentDetailData: any;

  loadingDetails = false;

  @Input() set treeNode(node: TreeNode) {
    this.activeNode = node;
    this.dateRangeSelected(this.defaultDateRange);
  }
  defaultDateRange = {
    from: moment().subtract(1, 'month').startOf('month').toISOString(),
    to: moment().subtract(1, 'month').endOf('month').toISOString(),
  };
  constructor(
    private sidebarService: SidebarService,
    private readonly kpiService: InsightDataKpiService,
  ) {}

  dateRangeSelected(range: any) {
    this.loadingDetails = true;
    this.kpiService.getEquipmentDetails(this.activeNode.id, range.from, range.to).subscribe(d => {
      this.currentDetailData = d;
      this.loadingDetails = false;
    });
    this.defaultDateRange = range;
  }

  ngOnInit(): void {}

  onBack() {
    // this.sidebarService.emitEvent({
    //   select: {
    //     node: {
    //       id: '4332f4b2-d5a2-4210-90a0-b4c8a3116b9f',
    //       children: [{
    //         id: '16123160-3215-4a9d-9be1-833ae90625d6'
    //       }]
    //     }
    //   }
    // });
  }
}
