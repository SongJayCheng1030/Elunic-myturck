import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface Tab {
  label: string;
  link: string;
  showHistory: boolean;
  createBtn: {
    label: string;
    link: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query?: any;
  };
}

@Component({
  selector: 'app-asset-tabs-outlet',
  templateUrl: './asset-tabs-outlet.component.html',
  styleUrls: ['./asset-tabs-outlet.component.scss'],
})
export class AssetTabsOutletComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject<void>();

  selectedTabIndex = 0;
  search = new FormControl([null]);

  tabs: Tab[] = [
    {
      label: 'VIEWS.ASSET_TABS.ALLOCATED_ASSETS',
      link: '/allocated-assets',
      showHistory: true,
      createBtn: { label: 'Create new asset', link: '/assets/new' },
    },
    {
      label: 'VIEWS.ASSET_TABS.ASSET_POOL',
      link: '/asset-pool',
      showHistory: true,
      createBtn: { label: 'VIEWS.ASSET_TABS.CREATE_NEW_ASSET', link: '/assets/new' },
    },
    {
      label: 'VIEWS.ASSET_TABS.ASSET_TYPES',
      link: '/asset-types',
      showHistory: false,
      createBtn: { label: 'VIEWS.ASSET_TABS.CREATE_NEW_ASSET_TYPE', link: '/asset-types/new' },
    },
    {
      label: 'VIEWS.ASSET_TABS.MAPS',
      link: '/asset-maps',
      showHistory: false,
      createBtn: { label: 'VIEWS.ASSET_TABS.CREATE_NEW_MAP', link: '/asset-maps/new' },
    },
    {
      label: 'VIEWS.ASSET_TABS.DEVICE_MANAGEMENT',
      link: '/device-management',
      showHistory: false,
      createBtn: {
        label: 'VIEWS.ASSET_TABS.CREATE_NEW_DEVICE',
        link: '/device-management',
        query: {
          mode: 'create',
        },
      },
    },
    {
      label: 'VIEWS.ASSET_TABS.MACHINE_VARIABLES',
      link: '/machine-variables',
      showHistory: false,
      createBtn: {
        label: 'VIEWS.ASSET_TABS.CREATE_NEW_MACHINE_VARIABLE',
        link: '/machine-variables',
        query: {
          mode: 'create',
        },
      },
    },
  ];

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    const path = this.getPath();
    this.selectedTabIndex = this.getSelectedTabIndex(path);

    const params = this.activatedRoute.snapshot.queryParams;
    this.search.setValue(params.q || null);

    this.search.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(term => {
      this.router.navigate([this.getPath()], { queryParams: { q: term } });
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  onNavigate(index: number): void {
    this.selectedTabIndex = index;
    this.search.setValue(null, { emitEvent: false });
    this.router.navigate([this.tabs[index].link]);
  }

  onBtnNavigate() {
    this.router.navigate([this.tabs[this.selectedTabIndex].createBtn.link], {
      queryParams: this.tabs[this.selectedTabIndex]?.createBtn?.query || {},
    });
  }

  private getSelectedTabIndex(currentUrl: string): number {
    const index = this.tabs.findIndex(tab => tab.link === currentUrl);
    return index > -1 ? index : 0;
  }

  private getPath() {
    return this.router.url.split('?')[0];
  }
}
