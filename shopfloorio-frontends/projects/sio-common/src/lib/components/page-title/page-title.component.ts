import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'lib-page-title',
  templateUrl: './page-title.component.html',
  styleUrls: ['./page-title.component.scss'],
})
export class PageTitleComponent implements OnInit {
  @Input()
  title = '';

  @Input()
  back = false;

  constructor(private router: Router) {}

  ngOnInit(): void {}

  goBack() {
    this.router.navigate(['/']);
  }
}
