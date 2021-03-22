import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PluginLauncherComponent } from './plugin-launcher.component';
import { IframeErrorDirective } from './iframe-error.directive';

@NgModule({
    imports: [
        CommonModule

    ],
    declarations: [
        PluginLauncherComponent,
        IframeErrorDirective
    ],
    exports: [
        PluginLauncherComponent,
    ]
})
export class PluginLauncherModule {
}
