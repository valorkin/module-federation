import { Injector, NgModule } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { BrowserModule } from '@angular/platform-browser';
import { AlertModule } from 'ngx-bootstrap/alert';
import { AppComponent } from './app.component';
import { PluginLauncherComponent } from './plugin-launcher/plugin-launcher.component';
import { PluginLauncherModule } from './plugin-launcher/plugin-launcher.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    PluginLauncherModule,
    AlertModule
  ],
  providers: [],
  entryComponents: [PluginLauncherComponent]
})
export class AppModule {
  constructor(readonly injector: Injector) {
    const ngElement = createCustomElement(PluginLauncherComponent, {injector});
    customElements.define('ngce-alert', ngElement);
  }

  ngDoBootstrap() {
  }
}
