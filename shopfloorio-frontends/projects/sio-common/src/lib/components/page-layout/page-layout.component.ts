import { Component, Input, OnInit } from '@angular/core';

import { IconUrlPipe } from '../../pipes';

@Component({
  selector: 'lib-page-layout',
  templateUrl: './page-layout.component.html',
  styleUrls: ['./page-layout.component.scss'],
})
export class PageLayoutComponent implements OnInit {
  @Input() title = '';

  @Input() back = false;

  @Input() hideHeader = false;

  @Input() backgroundImage: string | null = null;

  constructor() {}

  ngOnInit(): void {}

  get backgroundImageStyle() {
    if (this.backgroundImage) {
      return {
        'background-image': 'url(' + IconUrlPipe.do(this.backgroundImage) + ')',
      };
    }

    return {};
  }
}
