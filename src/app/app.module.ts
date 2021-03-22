import { Injector, NgModule } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { BrowserModule } from '@angular/platform-browser';
import { AlertModule } from 'ngx-bootstrap/alert';
import { AppComponent } from './app.component';
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
  bootstrap: [AppComponent],
  entryComponents: [AppComponent]
})
export class AppModule {
  constructor(readonly injector: Injector) {
    const ngElement = createCustomElement(AppComponent, {injector});
    customElements.define('ngce-alert', ngElement);
  }

  ngDoBootstrap() {
  }
}
