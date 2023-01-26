import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-equipment-throughput',
  templateUrl: './equipment-throughput.component.html',
  styleUrls: ['./equipment-throughput.component.scss'],
})
export class EquipmentThroughputComponent implements OnInit {
  @Input() title?: string;
  @Input() property?: any;

  difference = 0;

  constructor(private router: Router) {}

  ngOnInit(): void {}

  onMore() {
    // if (this.property?.id) {
    //   this.router.navigate([`/alarm-management/asset/${this.property.id}`]);
    // }
  }
}
