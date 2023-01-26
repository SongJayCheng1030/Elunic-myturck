import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

// Set the environment as global window variable
// (see EnvironmentService in sio-common)
(window as any).environment = environment;

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));
