import { Component, Input, OnInit } from '@angular/core';
import { SidebarService } from '@sio/common';

@Component({
  selector: 'app-mm-status',
  templateUrl: './mm-status.component.html',
  styleUrls: ['./mm-status.component.scss'],
})
export class MmStatusComponent implements OnInit {
  @Input() property?: any;

  constructor(private sidebarService: SidebarService) {}

  ngOnInit(): void {}

  onClick() {
    this.sidebarService.emitEvent({
      select: {
        node: this.property,
      },
    });
  }
}
