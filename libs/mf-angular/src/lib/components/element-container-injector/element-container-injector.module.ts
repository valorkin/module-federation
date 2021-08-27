import { Injector, NgModule } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { BrowserModule } from '@angular/platform-browser';
import { ContainerInjectorComponent } from '../container-injector/container-injector.component';
import { ContainerInjectorModule } from '../container-injector/container-injector.module';

@NgModule({
  declarations: [
  ],
  imports: [
    BrowserModule,
    ContainerInjectorModule
  ],
})
export class ElementContainerInjectorModule  {
  constructor(readonly injector: Injector) {
    const ngElement = createCustomElement(ContainerInjectorComponent, {injector});
    customElements.define('ngx-mf-element-injector', ngElement);
  }

  // tslint:disable-next-line:typedef
  ngDoBootstrap() {}
}
