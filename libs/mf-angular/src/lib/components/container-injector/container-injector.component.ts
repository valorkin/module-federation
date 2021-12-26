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

@Component({
  selector: 'ngx-mf-injector',
  styleUrls: ['./container-injector.component.scss'],
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContainerInjectorComponent implements OnChanges, OnInit, OnDestroy {
  @Input()
  container: string;

  @Input()
  module: string;

  @Output()
  error = new EventEmitter<Error>();

  containerUuid: string;

  baseUrl: string;

  rendererRef: CustomElementRendererRef | IframeRendererRef | NgComponentRendererRef;

  rendererContext: HTMLElement | IframeRendererContext | NgRendererContext;

  constructor(
    public readonly viewContainerRef: ViewContainerRef,
    public readonly injector: Injector,
    public readonly changeDetectorRef: ChangeDetectorRef,
    private readonly containersService: ContainersService,
    private readonly containerComponentsService: ContainerComponentsService
  ) {}

  /**
   *
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes.container || changes.module) {
      this.resolve();
    }
  }

  /**
   *
   */
  ngOnInit() {
    this.containerComponentsService.use(this);
  }

  /**
   *
   */
  ngOnDestroy() {
    this.containerComponentsService.unuse(this);
    this.clear();
  }

  /**
   *
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
        this.containersService.broadcast();
      });
  }

  /**
   *
   */
  clear() {
    if (this.rendererRef) {
      this.rendererRef.destroy(this.rendererContext as any);
    }
  }

  /**
   *
   */
  async render(resolvedConfiguration: ConfigurationObjectResolve) {
    const {configuration, configurationModule} = resolvedConfiguration;

    this.baseUrl = getBaseUrl(configuration.uri);
    this.rendererRef = this.injector.get(configurationModule.type);
    this.rendererContext = await this.rendererRef.render(resolvedConfiguration, this);
  }

  /**
   *
   */
  dispatchError(error: string | Error) {
    const message = wrapError(error);
    this.error.emit(message);
  }
}
