import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
// import { PluginLauncherModule } from '../../../mf-core/src/lib/components/plugin-launcher/plugin-launcher.module';
// import { CustomElementsPluginLauncherModule } from '../../../mf-core/src/lib/components/plugin-launcher/custom-elements-plugin-launcher.module';
// import { UrlOverriderPipe } from '../../../mf-core/src/lib/api/urls/url-overrider.pipe';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    // PluginLauncherModule,
    // CustomElementsPluginLauncherModule,
  ],
  declarations: [
    // UrlOverriderPipe,
  ],
  exports: [
    // PluginLauncherModule,
    // CustomElementsPluginLauncherModule,
    // UrlOverriderPipe,
  ]
})
export class NgxContainerInjectorModule {}
