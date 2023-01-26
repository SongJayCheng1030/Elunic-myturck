import { Component, Input } from '@angular/core';
import { TimeLine } from '@sio/common';

@Component({
  selector: 'app-asset-timeline',
  templateUrl: './asset-timeline.component.html',
  styleUrls: ['./asset-timeline.component.scss'],
})
export class AssetTimelineComponent {
  @Input() timelines: TimeLine[] = [];
}
