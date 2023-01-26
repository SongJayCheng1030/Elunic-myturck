import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-drag-and-drop',
  templateUrl: './drag-and-drop.component.html',
  styleUrls: ['./drag-and-drop.component.scss'],
})
export class DragAndDropComponent implements OnInit, OnDestroy {
  @Input() set startPoint(value: { top?: number; left?: number }) {
    this.draggable.nativeElement.style.left = (value.left || 0) + 'px';
    this.draggable.nativeElement.style.top = (value.top || 0) + 'px';
  }
  @ViewChild('draggable', { static: true }) draggable!: ElementRef<HTMLElement>;

  constructor() {}

  ngOnInit(): void {
    this.draggable.nativeElement.onmousedown = this.dragAndDropHandle.bind(this);
  }

  ngOnDestroy() {
    this.draggable.nativeElement.onmousedown = null;
  }

  dragAndDropHandle(e: any) {
    const isTarget = e.path.find(
      (el: HTMLElement) => el.className && el.className.includes('draggable'),
    );

    if (!isTarget) return;
    const draggableCoords = this.getCoords(this.draggable.nativeElement);
    const parentCoords = this.getCoords(
      this.draggable.nativeElement.parentElement
        ? this.draggable.nativeElement.parentElement
        : this.draggable.nativeElement,
    );
    const shiftX = e.pageX - draggableCoords.left + parentCoords.left;
    const shiftY = e.pageY - draggableCoords.top + parentCoords.top;

    this.draggable.nativeElement.style.position = 'absolute';
    this.moveAt(e, { shiftX, shiftY });

    this.draggable.nativeElement.onmousemove = (e: MouseEvent) => {
      this.moveAt(e, { shiftX, shiftY });
    };

    this.draggable.nativeElement.onmouseup = () => {
      this.draggable.nativeElement.onmousemove = null;
      // this.draggable.nativeElement.onmouseup = null;
    };

    this.draggable.nativeElement.ondragstart = () => {
      return false;
    };
  }

  getCoords(elem: HTMLElement) {
    let box = elem.getBoundingClientRect();
    return {
      top: box.top + pageYOffset,
      left: box.left + pageXOffset,
    };
  }

  moveAt(e: MouseEvent, { shiftX, shiftY }: { shiftX: number; shiftY: number }) {
    this.draggable.nativeElement.style.left = e.pageX - shiftX + 'px';
    this.draggable.nativeElement.style.top = e.pageY - shiftY + 'px';
  }
}
