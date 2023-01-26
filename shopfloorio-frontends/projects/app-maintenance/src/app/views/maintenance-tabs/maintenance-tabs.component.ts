import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';

@Component({
  selector: 'mnt-maintenance-tabs',
  templateUrl: './maintenance-tabs.component.html',
  styleUrls: ['./maintenance-tabs.component.scss'],
})
export class MaintenanceTabsComponent implements OnInit {
  showTabs$ = this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    startWith(null),
    map(() => this.route.snapshot.firstChild?.data),
    map(data => !data?.tabsHidden),
  );

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {}
}
