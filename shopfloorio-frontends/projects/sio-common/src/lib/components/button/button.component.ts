import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

import { GeneralConfigurationService } from '../../services/general-configuration.service';

@Component({
  selector: 'lib-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent implements OnInit, OnChanges {
  @Input()
  mode: 'primary' | 'transparent' | 'outline' | 'disabled' = 'primary';

  colorOptions = {
    'background-color': '',
    color: '',
    'border-color': '',
  };

  constructor(private generalConfigurationService: GeneralConfigurationService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.mode) {
      if (this.mode === 'primary') {
        this.generalConfigurationService.getGeneralConfiguration().subscribe(item => {
          if (!item) return;
          const primaryColor = item.find(v => v.key === 'primaryColor');
          if (primaryColor) {
            this.colorOptions['background-color'] = (primaryColor.value as string) || '';
          }
          this.colorOptions['color'] = '#fff';
        });
      } else {
        this.colorOptions = {
          'background-color': '#fff',
          color: '#0090d4',
          'border-color': '#0090d4',
        };
      }
    }
  }

  ngOnInit(): void {}

  onMouseIn() {
    const bgColor = this.colorOptions['background-color'];
    this.colorOptions['background-color'] = this.colorOptions['color'];
    this.colorOptions['color'] = bgColor;
    this.colorOptions['border-color'] = bgColor;
  }

  onMouseOut() {
    const bgColor = this.colorOptions['background-color'];
    this.colorOptions['background-color'] = this.colorOptions['color'];
    this.colorOptions['color'] = bgColor;
    this.colorOptions['border-color'] = '#fff';
  }
}
