import { Location } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'lib-page-card-layout',
  templateUrl: './page-card-layout.component.html',
  styleUrls: ['./page-card-layout.component.scss'],
})
export class PageCardLayoutComponent implements OnInit {
  @Input()
  title = '';

  @Input()
  showBackButton = true;

  constructor(public location: Location) {}

  ngOnInit(): void {}
}
