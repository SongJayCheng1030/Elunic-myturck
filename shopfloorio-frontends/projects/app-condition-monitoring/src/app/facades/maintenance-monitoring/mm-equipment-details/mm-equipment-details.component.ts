import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MaintenanceMonitoringService, SidebarService, TreeNode } from '@sio/common';
import { orderBy } from 'lodash';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-mm-equipment-details',
  templateUrl: './mm-equipment-details.component.html',
  styleUrls: ['./mm-equipment-details.component.scss'],
})
export class MmEquipmentDetailsComponent implements OnInit, OnDestroy {
  activeTreeNode?: TreeNode;

  statuses: any = {
    critical: {
      color: '#f0484f',
      icon: 'alarm',
      label: 'STATUS.CRITICAL',
      selected: true,
    },
    degrading: {
      color: '#f57100',
      icon: 'down',
      label: 'STATUS.DEGRADING',
      selected: true,
    },
    warning: {
      color: '#fcc83d',
      icon: 'warning',
      label: 'STATUS.WARNING',
      selected: true,
    },
    good: {
      color: '#e6e6e6',
      icon: 'good',
      label: 'STATUS.GOOD',
      selected: true,
    },
  };
  overview?: any;
  alarmAnalytics: any = [];
  componentAnalytics: any = [];
  recommendedAlarms: any = [];
  activePanelIds: any = [];
  filterForm!: FormGroup;
  unsubscribe = new Subject<void>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private mmApiService: MaintenanceMonitoringService,
    private sidebarService: SidebarService,
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
      this.sidebarService.emitEvent({ select: { node: { id: params.id }, silent: true } });
    });
    this.filterForm = this.fb.group({});
    for (const key of Object.keys(this.statuses)) {
      this.filterForm.addControl(key, this.fb.control(this.statuses[key].selected));
    }
    this.filterForm.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      this.filterForm.disable({ emitEvent: false });
      this.initComponents(this.selectedKeys(data));
    });
    this.mmApiService.getAlarmAnalytics().subscribe(data => {
      this.alarmAnalytics = orderBy(data, 'createdAt', 'desc');
      this.recommendedAlarms = this.alarmAnalytics.slice(0, 4);
      this.overview = {
        oee: 67,
        mcbi: 123,
        alarmCount: 123,
        pdmEvents: 34,
      };
    });
    this.initComponents(this.selectedKeys(this.statuses, 'selected'));
  }

  selectedKeys(obj: any, prop = '') {
    const keys: any = [];
    Object.keys(obj).forEach(key => {
      if ((prop && obj[key][prop]) || (!prop && obj[key])) {
        keys.push(key);
      }
    });
    return keys;
  }

  initComponents(statusFilter: string[] = []) {
    this.mmApiService.getComponentAnalytics().subscribe(data => {
      this.componentAnalytics = data.filter(
        (entry: any) => statusFilter.indexOf(entry.status) !== -1,
      );
      this.filterForm.enable({ emitEvent: false });
    });
    this.sidebarService.activeTreeNodeObservable
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((node: any) => (this.activeTreeNode = node));
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  onBack() {}

  panelChange(event: any) {
    if (event.nextState) {
      if (this.activePanelIds.indexOf(event.panelId) === -1) {
        this.activePanelIds.push(event.panelId);
      }
    } else {
      const index = this.activePanelIds.indexOf(event.panelId);
      if (index !== -1) {
        this.activePanelIds.splice(index, 1);
      }
    }
  }

  isActivePanel(panelId: string) {
    return this.activePanelIds?.indexOf(panelId) !== -1;
  }
}
