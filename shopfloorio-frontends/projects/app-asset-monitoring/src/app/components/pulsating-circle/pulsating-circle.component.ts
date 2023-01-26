import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-pulsating-circle',
  templateUrl: './pulsating-circle.component.html',
  styleUrls: ['./pulsating-circle.component.scss'],
})
export class PulsatingCircleComponent implements OnInit {
  @Input() color: string = '';
  @Input() title: string = '';

  constructor() {}

  ngOnInit(): void {}
}
