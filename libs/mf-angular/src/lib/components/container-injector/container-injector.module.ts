import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContainerInjectorComponent } from './container-injector.component';
// import { PluginPageLauncherComponent } from './plugin-page-launcher.component';
import { IframeErrorDirective } from '../../directives/iframe-error/iframe-error.directive';
import { UrlOverriderPipe } from '../../pipes/url/url-overrider.pipe'

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    ContainerInjectorComponent,
    // PluginPageLauncherComponent,
    IframeErrorDirective,
    UrlOverriderPipe,
  ],
  exports: [
    ContainerInjectorComponent,
    // PluginPageLauncherComponent,
    UrlOverriderPipe,
  ]
})
export class ContainerInjectorModule {}
