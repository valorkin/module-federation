import { ElementRef, Injectable } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ConfigurationObjectResolve, ConfigurationObjectPriorities, IframeRemoteContainerConfigurationModule } from '@mf/core';
import { ContainersService } from '../services/containers.service';
import { IframeRendererContext, ParentComponentRef, RendererRef } from './interface';

/**
 *
 */
 @Injectable()
 export class IframeRendererRef implements RendererRef {
  constructor(private readonly containersService: ContainersService) {}

  /**
   *
   */
  public render(resolvedConfiguration: ConfigurationObjectResolve, componentRef: ParentComponentRef): IframeRendererContext {
    const {configuration, configurationModule} = resolvedConfiguration;
    const {uri} = configuration;
    const {html} = configurationModule as IframeRemoteContainerConfigurationModule;

    const url = `${uri}${html}`;

    const element = document.createElement('iframe') as HTMLIFrameElement;
    element.classList.add('responsive-wrapper');
    element.src = url;

    const subscription = this.listen(element, componentRef);
    const componentElementRef = componentRef.injector.get(ElementRef);

    componentElementRef.nativeElement.append(element);

    return { element, subscription };
  }

  /**
   *
   */
  public destroy(context: IframeRendererContext) {
    context?.element?.remove();
    context?.subscription?.unsubscribe();
  }

  /**
   *
   */
  private listen(element: HTMLIFrameElement, componentRef: ParentComponentRef): Subscription {
    const src = element.getAttribute('src');

    element.addEventListener('error', () => this.onError(src, componentRef));

    const subscription = fromEvent(element, 'load')
      .pipe(
        debounceTime(100),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.onLoad(src, componentRef);
      });

    return subscription;
  }

  /**
   * Iframe element has the onerror event but it never gets called in our cases.
   * So we have to find another way to detect iframe error
   * Directive requests a resource and throws an error when response code is not between >= 200 <= 299
   */
  private onLoad(src: string, componentRef: ParentComponentRef) {
    if (!src || src.trim() === '') {
      return;
    }

    window.fetch(src)
      .then((response) => {
        if (!response.ok) {
          this.onError(src, componentRef);
        }
      })
      .catch(() => {
        this.onError(src, componentRef);
      });

  }

  /**
   *
   */
  private onError(src: string, componentRef: ParentComponentRef) {
    this.containersService.updatePriority(componentRef.containerUuid, ConfigurationObjectPriorities.Error);

    return componentRef.dispatchError(
      `ContainerInjectorIframeLoadingError: Can't fetch resource from ${src}`
    );
  }
 }
