import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';

interface Tab {
  label: string;
  link: string;
  showHistory: boolean;
  createBtn: {
    label: string;
    link: string;
  };
}

@Component({
  selector: 'app-users-tabs-outlet',
  templateUrl: './users-tabs-outlet.component.html',
  styleUrls: ['./users-tabs-outlet.component.scss'],
})
export class UsersTabsOutletComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject<void>();
  search: FormControl = new FormControl(null);

  selectedTabIndex = 0;

  tabs: Tab[] = [
    {
      label: 'ALL_USERS',
      link: '/users',
      showHistory: true,
      createBtn: { label: 'CREATE_A_NEW_USER', link: 'users/create' },
    },
    {
      label: 'ALL_ROLES',
      link: '/roles',
      showHistory: true,
      createBtn: { label: 'CREATE_A_NEW_ROLE', link: 'roles/create' },
    },
  ];

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    const [url] = this.router.url.split('?');
    this.selectedTabIndex = this.getSelectedTabIndex(url);
    const params = this.activatedRoute.snapshot.queryParams;
    if (params.q) {
      this.search.setValue(params.q || null);
    }
    this.search.valueChanges
      .pipe(distinctUntilChanged(), takeUntil(this.destroyed$))
      .subscribe(term =>
        this.router.navigate([], {
          relativeTo: this.activatedRoute,
          queryParams: { q: term },
        }),
      );
  }

  onNavigate(index: number): void {
    this.search.patchValue('');
    this.selectedTabIndex = index;
    this.router.navigate([this.tabs[index].link]);
  }

  private getSelectedTabIndex(currentUrl: string): number {
    const index = this.tabs.findIndex(tab => tab.link === currentUrl);
    return index > -1 ? index : 0;
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
