import {
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
export class ContainerInjectorComponent implements OnChanges, OnDestroy {
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
    private readonly containersService: ContainersService
  ) {}

  /**
   *
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes.container || changes.module) {
      this.onResolveContainer();
    }
  }

  /**
   *
   */
  ngOnDestroy() {
    this.unlisten();
  }

  /**
   *
   */
  onUpdateContainer(configurationObject: ConfigurationObject) {
    const {uuid, name, priority} = configurationObject;

    // created active CO
    if (this.containerUuid !== uuid) {
      if (name === this.container) {
        this.onResolveContainer();
        //this.changeDetectorRef.detectChanges();
        return;
      }
    }

    // updated CO
    this.container = name;

    if (priority === ConfigurationObjectPriorities.Active) {
      this.onResolveContainer();
      //this.changeDetectorRef.detectChanges();
    }
  }

  /**
   *
   */
  onResolveContainer() {
    this.containersService.resolve(this.container, this.module)
      .then((resolvedConfiguration) => {
        this.render(resolvedConfiguration);
      })
      .catch((error) => {
        this.dispatchError(error);
      });
  }

  /**
   *
   */
  onLoadIframeError() {
    this.dispatchError(
      `PluginLauncherIframeLoadingError: Can't fetch resource from ${this.iframeEl.nativeElement.src}`
    );
  }

  /**
   *
   */
  render(resolvedConfiguration: ConfigurationObjectResolve): void {
    const {configuration, configurationModule, module} = resolvedConfiguration;
    const {uuid, uri} = configuration;
    const {type, name} = configurationModule;

    this.relisten(uuid);

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
  private listen() {
    if (!this.containerUuid) {
      return;
    }

    this.containerSubscription = this.containersService.on(this.containerUuid, this.onUpdateContainer.bind(this));
  }

  /**
   *
   */
  private unlisten() {
    if (!this.containerUuid) {
      return;
    }

    this.containersService.off(this.containerUuid, this.containerSubscription);
    this.containerUuid = undefined;
    this.containerSubscription = null;
  }

  /**
   *
   */
  private relisten(uuid: string) {
    if (this.containerUuid === uuid) {
      return;
    }

    this.unlisten();
    this.containerUuid = uuid;
    this.listen();
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
    const pluginModuleName = configurationModule.name;
    let pluginComponentName = configurationModule.component;

    // if provided module name and component name we bootstrap both
    if (pluginModuleName && pluginComponentName) {
      this._ngModule = await this.compiler.compileModuleAsync(module);
      this._ngComponent = remoteModule[pluginComponentName];
    }

    // if component name is not provided, we suppose that `name` is a component name
    if (!pluginComponentName) {
      pluginComponentName = pluginModuleName;
      this._ngModule = void 0;
      this._ngComponent = remoteModule[pluginComponentName];
    }

    // check if component is a function
    const isComponentDefined = typeof this._ngComponent === 'function';

    if (!isComponentDefined) {
      return this.dispatchError(
        `PluginLauncherComponentResolveError: Can't resolve a component with name ${pluginComponentName}`
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
