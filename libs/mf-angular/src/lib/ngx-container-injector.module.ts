import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ContainerInjectorModule } from './components/container-injector/container-injector.module';
import { ElementContainerInjectorModule } from './components/element-container-injector/element-container-injector.module';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    ContainerInjectorModule,
    ElementContainerInjectorModule,
  ],
  declarations: [],
  exports: [
    ContainerInjectorModule,
    ElementContainerInjectorModule,
  ]
})
export class NgxContainerInjectorModule {}
