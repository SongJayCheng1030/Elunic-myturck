import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';

const ZOOM_SPEED = 0.1;

@Component({
  selector: 'app-zoom',
  templateUrl: './zoom.component.html',
  styleUrls: ['./zoom.component.scss'],
})
export class ZoomComponent implements OnInit, OnDestroy {
  @Input() set defaultZoom(value: number) {
    this.zoom = value;
    this.zoomTarget.nativeElement.style.transform = `scale(${this.zoom})`;
  }
  zoom = 1;

  @ViewChild('zoomTarget', { static: true }) zoomTarget!: any;

  @Output('zoomChange') zoomChange = new EventEmitter();

  constructor() {}

  ngOnInit(): void {
    document.addEventListener('wheel', this.zoomHandle.bind(this));
  }

  ngOnDestroy(): void {
    document.removeEventListener('wheel', this.zoomHandle.bind(this));
  }

  zoomHandle(e: any) {
    if (e.deltaY > 0) {
      const scale = this.zoom - ZOOM_SPEED;
      if (scale < 0.1) return;
      this.zoom = scale;
      this.zoomTarget.nativeElement.style.transform = `scale(${scale})`;
    } else {
      this.zoomTarget.nativeElement.style.transform = `scale(${(this.zoom += ZOOM_SPEED)})`;
    }

    this.zoomChange.emit(this.zoom);
  }
}
