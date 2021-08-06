import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PluginLauncherModule } from './components/plugin-launcher/plugin-launcher.module';
import { CustomElementsPluginLauncherModule } from './components/plugin-launcher/custom-elements-plugin-launcher.module';
import { HttpClientModule } from '@angular/common/http';
import { UrlOverriderPipe } from './api/urls/url-overrider.pipe';

@NgModule({
    imports: [
        CommonModule,
        HttpClientModule,
        PluginLauncherModule,
        CustomElementsPluginLauncherModule,
    ],
    declarations: [
        UrlOverriderPipe,
    ],
    exports: [
        PluginLauncherModule,
        CustomElementsPluginLauncherModule,
        UrlOverriderPipe,
    ]
})
export class ModuleFederationCoreModule {}
