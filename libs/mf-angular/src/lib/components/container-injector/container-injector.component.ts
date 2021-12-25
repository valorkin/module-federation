import {
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Compiler,
  Component,
  Injector,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  NgModuleFactory,
  OnChanges,
  SimpleChanges,
  Type,
  ViewChild,
  NgZone
} from '@angular/core';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

import {
  InjectorTypes,
  RemoteContainerConfiguration,
  ConfigurationObject,
  ConfigurationObjectResolve,
  IframeRemoteContainerConfigurationModule,
  NgRemoteContainerConfigurationModule,
  RemoteContainerConfigurationModule,
  getBaseUrl,
  overrideElementUrls,
  wrapError,
  ConfigurationObjectPriorities
} from '@mf/core';

import { ContainersService } from '../../services/containers.service';
import { REMOTE_BASE_URL } from '../../tokens';
import { ContainerComponentsService } from '../../services/container-components.service';

@Component({
  selector: 'ngx-mf-injector',
  styleUrls: ['./container-injector.component.scss'],
  template: `
    <ng-container *ngComponentOutlet="_ngComponent; ngModuleFactory: _ngModule; injector: _ngComponentInjector">
    </ng-container>
    <iframe *ngIf="safeIframeUri"
            #iframe
            class="responsive-wrapper"
            [src]="safeIframeUri"
            ngxMfIframeError
            (ngxMfError)="onLoadIframeError()"
            (error)="onLoadIframeError()">
    </iframe>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContainerInjectorComponent implements OnChanges, OnInit, OnDestroy {
  // Remote Container Configuration name
  @Input()
  container: string;

  // Remote Container Configuration Module name
  @Input()
  module: string;

  // Remote Container Configurations
  @Input()
  containers: RemoteContainerConfiguration[];

  @Output()
  error = new EventEmitter<Error>();

  @ViewChild('iframe', { static: false })
  iframeEl: ElementRef;

  baseUrl: string;
  safeIframeUri: SafeResourceUrl;

  containerUuid: string;
  containerSubscription: Subscription;

  _ngComponentInjector: Injector;
  _ngComponent: Type<any>;
  _ngModule: NgModuleFactory<any>;

  constructor(
    private readonly elementRef: ElementRef,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly injector: Injector,
    private readonly ngZone: NgZone,
    private readonly sanitizer: DomSanitizer,
    private readonly compiler: Compiler,
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
  }

  /**
   *
   */
  onLoadIframeError() {
    this.containersService.updatePriority(this.containerUuid, ConfigurationObjectPriorities.Error);

    this.dispatchError(
      `PluginLauncherIframeLoadingError: Can't fetch resource from ${this.iframeEl.nativeElement.src}`
    );
  }

  /**
   *
   */
  resolve() {
    this.containersService.resolve(this.container, this.module)
      .then((resolvedConfiguration) => {
        this.containerUuid = resolvedConfiguration.configuration.uuid;
        this.render(resolvedConfiguration);
      })
      .catch(({uuid, error}) => {
        this.containerUuid = uuid;
        this.dispatchError(error);
      })
      .finally(() => {
        this.containersService.broadcast();
      });
  }

  /**
   *
   */
  render(resolvedConfiguration: ConfigurationObjectResolve): void {
    const {configuration, configurationModule, module} = resolvedConfiguration;
    const {uri} = configuration;
    const {type, name} = configurationModule;

    if (this.detectIframe(type)) {
      // if module type is an iframe we should not load one as a remote module
      return this.renderIframe(configuration, configurationModule as IframeRemoteContainerConfigurationModule);
    }

    this.baseUrl = getBaseUrl(uri);

    const moduleFactory = module[name];

    if (type === InjectorTypes.NgCustomElement) {
      return this.renderCustomElement(moduleFactory);
    }

    if (type === InjectorTypes.NgComponent) {
      this.renderComponent(moduleFactory, configurationModule as NgRemoteContainerConfigurationModule, module);
    }
  }

  /**
   *
   */
  private detectIframe(type: string): boolean {
    const isNotIframeType = type !== InjectorTypes.Iframe;

    if (isNotIframeType) {
      this.safeIframeUri = null;
      return false;
    }

    return true;
  }

  /**
   *
   */
  private renderIframe(configuration: Partial<RemoteContainerConfiguration>, configurationModule: IframeRemoteContainerConfigurationModule): void {
    const url = `${configuration.uri}${configurationModule.html}`;
    this.safeIframeUri = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  /**
   *
   */
  private renderCustomElement(elementName: string): void {
    const element = document.createElement(elementName);
    const definedCustomElement = window.customElements.get(elementName);
    const isCustomElement = definedCustomElement && element instanceof definedCustomElement;

    // custom element is unknown in DOM
    if (!isCustomElement) {
      this.containersService.updatePriority(this.containerUuid, ConfigurationObjectPriorities.Error);

      return this.dispatchError(
        `PluginLauncherCustomElementResolveError: An element with name ${elementName} is not registered`
      );
    }

    this.elementRef.nativeElement.append(element);
    this.overrideElementUrls();
  }

  /**
   *
   */
  private async renderComponent(module: any, configurationModule: NgRemoteContainerConfigurationModule, remoteModule: RemoteContainerConfigurationModule): Promise<void> {
    const moduleName = configurationModule.name;
    let componentName = configurationModule.component;

    // if provided module name and component name we bootstrap both
    if (moduleName && componentName) {
      try {
        this._ngModule = await this.compiler.compileModuleAsync(module);
      } catch {
        this.containersService.updatePriority(this.containerUuid, ConfigurationObjectPriorities.Error);
      }

      this._ngComponent = remoteModule[componentName];
    }

    // if component name is not provided, we suppose that `name` is a component name
    if (!componentName) {
      componentName = moduleName;
      this._ngModule = void 0;
      this._ngComponent = remoteModule[componentName];
    }

    // check if component is a function
    const isComponentDefined = typeof this._ngComponent === 'function';

    if (!isComponentDefined) {
      this.containersService.updatePriority(this.containerUuid, ConfigurationObjectPriorities.Error);

      return this.dispatchError(
        `PluginLauncherComponentResolveError: Can't resolve a component with name ${componentName}`
      );
    }

    this.injectBaseUrlToComponent();
    this.overrideElementUrls();
    this.changeDetectorRef.detectChanges();
  }

  /**
   *
   */
  private dispatchError(error: string | Error) {
    const message = wrapError(error);
    this.error.emit(message);
  }

  /**
   *
   */
  private overrideElementUrls() {
    this.ngZone.runOutsideAngular(() =>
      window.setTimeout(() => {
        overrideElementUrls(this.elementRef.nativeElement, this.baseUrl);
      })
    );
  }

  /**
   * Injects the domain name to dynamically created component
   * To be used for UrlOverriderPipe
   */
  private injectBaseUrlToComponent() {
    this._ngComponentInjector = Injector.create({
      providers: [
        {
          provide: REMOTE_BASE_URL,
          deps: [],
          useValue: this.baseUrl
        },
      ],
      parent: this.injector
    })
  }
}
