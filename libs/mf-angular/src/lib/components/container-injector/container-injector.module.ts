import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContainerTypes } from '@mf/core';
import { ContainerInjectorComponent } from './container-injector.component';
import { UrlOverriderPipe } from '../../pipes/url/url-overrider.pipe';
import { CustomElementRendererRef } from '../../renderers/custom-element.renderer';
import { IframeRendererRef } from '../../renderers/iframe.renderer';
import { NgComponentRendererRef } from '../../renderers/ng-component.renderer';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    ContainerInjectorComponent,
    UrlOverriderPipe,
  ],
  providers: [
    { provide: ContainerTypes.Element, useClass: CustomElementRendererRef },
    { provide: ContainerTypes.Iframe, useClass: IframeRendererRef },
    { provide: ContainerTypes.Angular, useClass: NgComponentRendererRef }
  ],
  exports: [
    ContainerInjectorComponent,
    UrlOverriderPipe
  ]
})
export class ContainerInjectorModule {}
