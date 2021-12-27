import {
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ViewContainerRef
} from '@angular/core';

import {
  ConfigurationObjectResolve,
  getBaseUrl,
  wrapError
} from '@mf/core';

import { ContainersService } from '../../services/containers.service';
import { ContainerComponentsService } from '../../services/container-components.service';
import { CustomElementRendererRef } from '../../renderers/custom-element.renderer';
import { IframeRendererRef } from '../../renderers/iframe.renderer';
import { NgComponentRendererRef } from '../../renderers/ng-component.renderer';
import { IframeRendererContext, NgRendererContext } from '../../renderers/interface';

/**
 * Class is responsible to render 3 types of Module Federated Containers:
 * Angular Component, Custom Element and Iframe
 */
@Component({
  selector: 'ngx-mf-injector',
  styleUrls: ['./container-injector.component.scss'],
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContainerInjectorComponent implements OnChanges, OnInit, OnDestroy {
  // Container name of a Module Federated Container (resolved by Webpack)
  @Input()
  container: string;

  // Name of a class to be injected
  @Input()
  module: string;

  @Output()
  error = new EventEmitter<Error>();

  // Unique id of a Container
  containerUuid: string;

  // Domain url of a remote Container
  baseUrl: string;

  // Renderer which renders a Container depending on one's type
  rendererRef: CustomElementRendererRef | IframeRendererRef | NgComponentRendererRef;

  // Processed data of a Renderer
  rendererContext: HTMLElement | IframeRendererContext | NgRendererContext;

  constructor(
    public readonly viewContainerRef: ViewContainerRef,
    public readonly injector: Injector,
    public readonly changeDetectorRef: ChangeDetectorRef,
    private readonly containersService: ContainersService,
    private readonly containerComponentsService: ContainerComponentsService
  ) {}

  /**
   * Handles component input data
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes.container || changes.module) {
      this.resolve();
    }
  }

  /**
   * Mounts the current injector component to be updated on Container lifecycle events
   */
  ngOnInit() {
    this.containerComponentsService.use(this);
  }

  /**
   * Unmounts the injector component from Container lifecycle events
   * Unmounts the Container for the injector component
   * Flushes Renderer data to prevent memory leaks
   */
  ngOnDestroy() {
    this.containerComponentsService.unuse(this);
    this.containersService.unuse(this.containerUuid);
    this.clear();
  }

  /**
   * Resolves a Container by name and module
   */
  resolve() {
    this.containersService.resolve(this.container, this.module)
      .then((resolvedConfiguration) => {
        this.containerUuid = resolvedConfiguration.configuration.uuid;
        this.clear();
        this.render(resolvedConfiguration);
      })
      .catch(({uuid, error}) => {
        this.containerUuid = uuid;
        this.clear();
        this.dispatchError(error);
      })
      .finally(() => {
        // broadcast all events to the Chrome Extension
        this.containersService.broadcast();
      });
  }

  /**
   * Flushes Renderer data, is ushed before rendering a new Container
   */
  clear() {
    if (this.rendererRef) {
      this.rendererRef.destroy(this.rendererContext as any);
    }
  }

  /**
   * Emits an error of the injector component
   */
   dispatchError(error: string | Error) {
    const message = wrapError(error);
    this.error.emit(message);
  }

  /**
   * Renders a Container by its type
   */
  async render(resolvedConfiguration: ConfigurationObjectResolve) {
    const {configuration, configurationModule} = resolvedConfiguration;

    this.baseUrl = getBaseUrl(configuration.uri);
    // getting a Renderer
    this.rendererRef = this.injector.get(configurationModule.type);
    // processing data of Renderer
    this.rendererContext = await this.rendererRef.render(resolvedConfiguration, this);
  }
}
