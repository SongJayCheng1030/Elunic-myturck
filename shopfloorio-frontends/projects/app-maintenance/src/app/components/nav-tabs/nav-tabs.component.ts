import { Component } from '@angular/core';

@Component({
  selector: 'mnt-nav-tabs',
  templateUrl: './nav-tabs.component.html',
  styleUrls: ['./nav-tabs.component.scss'],
})
export class NavTabsComponent {
  links = [
    { title: 'Active maintenances', route: ['/', 'executions'], queryParamsHandling: 'merge' },
    { title: 'Archived maintenances', route: '/archive', queryParamsHandling: '' },
    { title: 'Maintenance plans', route: '/procedures', queryParamsHandling: '' },
    { title: 'Maintenance step library', route: '/steps-library', queryParamsHandling: '' },
  ];
}
