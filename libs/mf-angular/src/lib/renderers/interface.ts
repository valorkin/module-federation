import { Injector, ChangeDetectorRef, NgModuleRef, ViewContainerRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConfigurationObjectResolve } from '@mf/core';

export interface RendererRef {
  render(resolvedConfiguration: ConfigurationObjectResolve, componentRef: any): any;
  destroy(context: any): void;
}

export interface ParentComponentRef {
  containerUuid: string;
  baseUrl: string;
  injector: Injector;
  dispatchError(error: string | Error);
}

export interface NgParentComponentRef extends ParentComponentRef {
  viewContainerRef: ViewContainerRef;
  changeDetectorRef: ChangeDetectorRef;
}

export interface IframeRendererContext {
  element: HTMLIFrameElement;
  subscription: Subscription;
}

export interface NgRendererContext {
  moduleRef: NgModuleRef<any> | null;
  viewContainerRef: ViewContainerRef;
}
