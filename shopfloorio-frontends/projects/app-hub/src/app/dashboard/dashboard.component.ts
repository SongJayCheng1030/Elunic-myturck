import { Component, OnInit } from '@angular/core';

import { HubTitleService } from './shared/services/hub-title.service';
import { DemoDataGeneratorService } from './shared/services/demo-data-generator.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  title = '';
  constructor(
    private hubTitleService: HubTitleService,
    private demoDataGeneratorService: DemoDataGeneratorService,
  ) {}

  ngOnInit(): void {
    this.hubTitleService.getTitle().subscribe(value => {
      this.title = value;
    });
    this.demoDataGeneratorService.initDemoData();
  }
}
