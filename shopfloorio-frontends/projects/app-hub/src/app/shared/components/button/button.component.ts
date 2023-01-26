import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GeneralConfigurationService } from '@sio/common';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent implements OnInit {
  @Input() mode: 'primary' | 'transparent' | 'outline' = 'primary';
  colorOptions = {
    'background-color': '',
    color: '',
    'border-color': '',
  };

  @Output() handleChange = new EventEmitter();
  constructor(private generalConfigurationService: GeneralConfigurationService) {}

  ngOnInit(): void {
    this.generalConfigurationService.getGeneralConfiguration().subscribe(item => {
      if (!item) return;
      const primaryColor = item.find(v => v.key === 'primaryColor');
      if (primaryColor) {
        switch (this.mode) {
          case 'primary':
            this.colorOptions['background-color'] = (primaryColor.value as string) || '';

            this.colorOptions['color'] = '#fff';
            break;
          case 'outline':
            this.colorOptions['border-color'] = (primaryColor.value as string) || '';
            this.colorOptions['color'] = (primaryColor.value as string) || '';

            this.colorOptions['background-color'] = '#fff';
            break;
          default:
            break;
        }
      }
    });
  }

  onMouseIn() {
    this.reverseColors();
  }

  onMouseOut() {
    this.reverseColors();
  }

  reverseColors() {
    const bgColor = this.colorOptions['background-color'];
    this.colorOptions['background-color'] = this.colorOptions['color'];
    this.colorOptions['color'] = bgColor;
    this.colorOptions['border-color'] = bgColor;
  }

  click() {
    this.handleChange.emit();
  }
}
