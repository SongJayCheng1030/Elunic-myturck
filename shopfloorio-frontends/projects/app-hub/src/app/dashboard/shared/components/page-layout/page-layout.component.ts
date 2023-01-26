import { Component, OnInit } from '@angular/core';

import { GeneralConfigurationService } from '../../services/general-configuration.service';

@Component({
  selector: 'app-page-layout',
  templateUrl: './page-layout.component.html',
  styleUrls: ['./page-layout.component.scss'],
})
export class PageLayoutComponent implements OnInit {
  bgImage = '';

  constructor(private generalConfigurationService: GeneralConfigurationService) {}

  ngOnInit(): void {
    this.generalConfigurationService.getGeneralConfiguration().subscribe(() => {
      const bgImage = this.generalConfigurationService.getProperty('bgImage');
      if (bgImage) this.bgImage = bgImage.value as string;
    });
  }
}
