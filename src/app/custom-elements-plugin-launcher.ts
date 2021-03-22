import { Injector, NgModule } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { BrowserModule } from '@angular/platform-browser';
import { PluginLauncherComponent } from './plugin-launcher/plugin-launcher.component';
import { PluginLauncherModule } from './plugin-launcher/plugin-launcher.module';

@NgModule({
  declarations: [
  ],
  imports: [
    BrowserModule,
    PluginLauncherModule
  ],
})
export class CustomElementsPluginLauncher {
  constructor(readonly injector: Injector) {
    const ngElement = createCustomElement(PluginLauncherComponent, {injector});
    customElements.define('ngce-alert', ngElement);
  }

  ngDoBootstrap() {
  }
}
