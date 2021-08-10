import { Injector, NgModule } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { BrowserModule } from '@angular/platform-browser';
import { PluginLauncherComponent } from './plugin-launcher.component';
import { PluginLauncherModule } from './plugin-launcher.module';

@NgModule({
  declarations: [
  ],
  imports: [
    BrowserModule,
    PluginLauncherModule
  ],
})
export class CustomElementsPluginLauncherModule {
  constructor(readonly injector: Injector) {
    const ngElement = createCustomElement(PluginLauncherComponent, {injector});
    customElements.define('ngel-injector', ngElement);
  }

  // tslint:disable-next-line:typedef
  ngDoBootstrap() {
  }
}
