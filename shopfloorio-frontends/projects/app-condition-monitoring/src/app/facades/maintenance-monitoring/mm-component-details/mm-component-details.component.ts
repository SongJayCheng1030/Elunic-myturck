import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SidebarService, TreeNode } from '@sio/common';
import moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { LimitRulesModalComponent } from './limit-rules-modal/limit-rules-modal.component';

@Component({
  selector: 'app-mm-component-details',
  templateUrl: './mm-component-details.component.html',
  styleUrls: ['./mm-component-details.component.scss'],
})
export class MmComponentDetailsComponent implements OnInit, OnDestroy {
  activeTreeNode?: TreeNode;
  selectedComponent?: any;

  defaultDateRange = {
    from: moment().subtract(1, 'month').startOf('month').toISOString(),
    to: moment().subtract(1, 'month').endOf('month').toISOString(),
  };
  statuses = [
    {
      color: '#f0484f',
      icon: 'alarm',
      label: 'STATUS.CRITICAL',
    },
    {
      color: '#f57100',
      icon: 'down',
      label: 'STATUS.DEGRADING',
    },
    {
      color: '#fcc83d',
      icon: 'warning',
      label: 'STATUS.WARNING',
    },
    {
      color: '#e6e6e6',
      icon: 'good',
      label: 'STATUS.GOOD',
    },
  ];
  componentAnalytics = [
    {
      color: '#fbc08e',
      label: 'VIEWS.MAINTENANCE_MONITORING.COMPONENT_ANALYTICS.ALARMS',
      value: 23,
    },
    {
      color: '#dddddd',
      label: 'VIEWS.MAINTENANCE_MONITORING.COMPONENT_ANALYTICS.AUTO_RETRY',
      value: 35,
    },
    {
      color: '#a0a8b6',
      label: 'VIEWS.MAINTENANCE_MONITORING.COMPONENT_ANALYTICS.CONFIGURATION_CHANGES',
      value: 12,
    },
  ];
  componentStats = [
    {
      stat: 'mean',
      label: 'VIEWS.MAINTENANCE_MONITORING.COMPONENT_ANALYTICS.STAT.MEAN',
      value: 23,
    },
    {
      stat: 'median',
      label: 'VIEWS.MAINTENANCE_MONITORING.COMPONENT_ANALYTICS.STAT.MEDIAN',
      value: 30,
    },
    {
      stat: 'min',
      label: 'VIEWS.MAINTENANCE_MONITORING.COMPONENT_ANALYTICS.STAT.MIN',
      value: 0,
    },
    {
      stat: 'max',
      label: 'VIEWS.MAINTENANCE_MONITORING.COMPONENT_ANALYTICS.STAT.MAX',
      value: 60,
    },
    {
      stat: 'warningCount',
      label: 'VIEWS.MAINTENANCE_MONITORING.COMPONENT_ANALYTICS.STAT.WARNING_COUNT',
      value: 30,
    },
    {
      stat: 'criticalCount',
      label: 'VIEWS.MAINTENANCE_MONITORING.COMPONENT_ANALYTICS.STAT.CRITICAL_COUNT',
      value: 30,
    },
  ];
  usage = {
    actual: 12345,
    target: 12345,
  };
  performanceMedian = {
    actual: 12345,
    target: 12345,
  };
  maintenanceDates = {
    last: 12345,
    nextRecommended: 12345,
  };
  indicators = [
    {
      key: 'extend',
      label: 'TOOLBAR.BUTTONS.EXTEND',
    },
    {
      key: 'retract',
      label: 'TOOLBAR.BUTTONS.RETRACT',
    },
  ];
  property: any = {
    performanceHistory: [],
    settings: {
      indicator: this.indicators[0],
      warningLimitMin: 30,
      warningLimitMax: 65,
      criticalLimitMin: 18,
      criticalLimitMax: 85,
    },
  };
  unsubscribe = new Subject<void>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private modalService: NgbModal,
    private sidebarService: SidebarService,
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
      this.sidebarService.emitEvent({ select: { node: { id: params.id }, silent: true } });
    });
    this.sidebarService.activeTreeNodeObservable
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((node: any) => (this.activeTreeNode = node));
    this.selectedComponent = this.activatedRoute.snapshot.data.component;
    [
      { time: '2021-01-01T12:00:00.000Z', value: 44 },
      { time: '2021-01-05T12:00:00.000Z', value: 95 },
      { time: '2021-01-10T12:00:00.000Z', value: 73 },
      { time: '2021-01-15T12:00:00.000Z', value: 96 },
      { time: '2021-01-20T12:00:00.000Z', value: 46 },
      { time: '2021-01-25T12:00:00.000Z', value: 95 },
      { time: '2021-01-30T12:00:00.000Z', value: 74 },
    ].forEach(entry => this.property.performanceHistory.push(entry));
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  onBack() {
    this.sidebarService.emitEvent({ select: { node: this.activeTreeNode } });
  }

  dateRangeSelected(range: any) {}

  onIndicator(event: any) {
    this.property.settings = { ...this.property.settings };
  }

  async onLimitRules(): Promise<void> {
    if (this.selectedComponent) {
      const result = await this.openLimitRules({
        name: this.selectedComponent.name,
        ...this.property.settings,
      });
      if (result && result.property) {
        this.property.settings = { ...result.property };
      }
    }
  }

  private openLimitRules(property?: any): Promise<any | null> {
    const modal = this.modalService.open(LimitRulesModalComponent, {
      centered: true,
      backdrop: 'static',
    });

    if (property) {
      modal.componentInstance.property = property;
    }
    return modal.result;
  }
}
