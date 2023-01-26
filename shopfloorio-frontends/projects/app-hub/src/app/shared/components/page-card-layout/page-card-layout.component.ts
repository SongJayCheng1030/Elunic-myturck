import { Location } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-page-card-layout',
  templateUrl: './page-card-layout.component.html',
  styleUrls: ['./page-card-layout.component.scss'],
})
export class PageCardLayoutComponent implements OnInit {
  @Input() title = '';

  constructor(public _location: Location) {}

  ngOnInit(): void {}
}
