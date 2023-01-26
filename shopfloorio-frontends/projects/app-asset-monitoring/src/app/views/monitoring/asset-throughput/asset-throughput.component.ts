import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-asset-throughput',
  templateUrl: './asset-throughput.component.html',
  styleUrls: ['./asset-throughput.component.scss'],
})
export class AssetThroughputComponent {
  @Input() title?: string;
  @Input() property?: any;
  @Input() unit?: string;
}
