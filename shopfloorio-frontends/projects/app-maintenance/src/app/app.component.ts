import { Component, OnInit } from '@angular/core';
import { EnvironmentService } from '@sio/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private readonly environment: EnvironmentService) {}

  ngOnInit(): void {
    this.environment.currentAppUrl = 'maintenance';
  }
}
