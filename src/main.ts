import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { CustomElementsPluginLauncher } from './app/custom-elements-plugin-launcher';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(CustomElementsPluginLauncher)
  .catch(err => console.error(err));
