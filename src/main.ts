import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { CustomElementsPluginLauncher } from './app/custom-elements-plugin-launcher';
import { environment } from './environments/environment';
import { loadPluginsJson } from './plugins-bootstrap';

if (environment.production) {
  enableProdMode();
}

loadPluginsJson()
  .then(() => {
    platformBrowserDynamic()
      .bootstrapModule(CustomElementsPluginLauncher)
      .catch(err => console.error(err));
  })
  .catch(() => {
    throw new Error(`CustomElementsPluginLauncherPluginsJsonLoadingError: An error occurred while loading 'plugins.json'`);
  });
