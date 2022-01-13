import { ElementRef, Injectable } from '@angular/core';
import { ConfigurationObjectResolve, ConfigurationObjectPriorities } from '@mf/core';
import { ContainersService } from '../services/containers.service';
import { ElementUrlsOverriderService } from '../services/urls-overrider.service';
import { ParentComponentRef, RendererRef } from './interface';

/**
 *
 */
@Injectable()
export class CustomElementRendererRef implements RendererRef {
  constructor(
    private readonly containersService: ContainersService,
    private readonly elementUrlsOverriderService: ElementUrlsOverriderService
  ) {}

  /**
   *
   */
  public render(resolvedConfiguration: ConfigurationObjectResolve, componentRef: ParentComponentRef): HTMLElement {
    const {configurationModule, module} = resolvedConfiguration;
    const {name} = configurationModule;

    const elementName = module[name];
    const element = document.createElement(elementName);
    const definedCustomElement = window.customElements.get(elementName);
    const isCustomElement = definedCustomElement && element instanceof definedCustomElement;

    // custom element is unknown in DOM
    if (!isCustomElement) {
      this.containersService.updatePriority(componentRef.containerUuid, ConfigurationObjectPriorities.Error);

      return componentRef.dispatchError(
        `ContainerInjectorCustomElementResolveError: An element with name ${elementName} is not registered`
      );
    }

    const componentElementRef = componentRef.injector.get(ElementRef);
    componentElementRef.nativeElement.append(element);

    this.elementUrlsOverriderService.override(element, componentRef.baseUrl);
    return element;
  }

  /**
   *
   */
  public destroy(element: HTMLElement) {
    element?.remove();
  }
}
