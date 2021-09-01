import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import {
  FundamentalNgxCoreModule,
  IconModule,
  LayoutGridModule,
  LayoutPanelModule,
  LinkModule,
  AvatarModule,
  ButtonModule,
  MenuModule,
  ShellbarModule
} from '@fundamental-ngx/core';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxContainerInjectorModule } from '@mf/angular'
import { HttpClientModule } from '@angular/common/http';

import {
  IframeLandingComponent,
  LandingComponent
} from './components';

import { AppComponent } from './app.component';
import { APP_ROUTES } from './app.routes';

@NgModule({
  imports: [
    BrowserModule,
    RouterModule.forRoot(APP_ROUTES, { relativeLinkResolution: 'legacy' }),
    HttpClientModule,
    FormsModule,
    IconModule,
    LayoutGridModule,
    LayoutPanelModule,
    LinkModule,
    FundamentalNgxCoreModule,
    AvatarModule,
    ButtonModule,
    MenuModule,
    ShellbarModule,
    BrowserAnimationsModule,
    NgxContainerInjectorModule,
  ],
  declarations: [
    AppComponent,
    IframeLandingComponent,
    LandingComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}

