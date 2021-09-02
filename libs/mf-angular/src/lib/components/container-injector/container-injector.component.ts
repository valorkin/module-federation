import {
  AfterViewChecked,
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
  Renderer2,
  SimpleChanges,
  Type,
  ViewChild,
  NgZone
} from '@angular/core';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import {
  InjectorTypes,
  RemoteContainerConfiguration,
  ConfigurationObjectResolve,
  IframeRemoteContainerConfigurationModule,
  NgRemoteContainerConfigurationModule,
  RemoteContainerConfigurationModule,
  loadModuleFederatedApp,
  addModuleFederatedApps,
  getBaseUrl,
  overrideElementUrls
} from '@mf/core';

import { REMOTE_BASE_URL } from '../../tokens';

@Component({
  selector: 'ngx-mf-injector',
  styleUrls: ['./container-injector.component.scss'],
  template: `
    <ng-container *ngComponentOutlet="_ngComponent; ngModuleFactory: _ngModule; injector: _ngComponentInjector">
    </ng-container>
    <iframe *ngIf="_safeIframeUri"
            #iframe
            class="responsive-wrapper"
            [src]="_safeIframeUri"
            [style.minHeight]="iframeAttrs?.height"
            ngxMfIframeError
            (ngxMfError)="onLoadIframeError()"
            (error)="onLoadIframeError()">
    </iframe>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContainerInjectorComponent implements OnChanges, AfterViewChecked {
  // Remote Container Configuration name
  @Input()
  container: string;

  // Remote Container Configuration Module name
  @Input()
  module: string;

  // Remote Container Configurations
  @Input()
  containers: RemoteContainerConfiguration[];

  /** Iframe URI */
  @Input()
  iframeUri: string;

  @Input()
  iframeAttrs: Record<string, string | number>;

  @Output()
  error = new EventEmitter<Error>();

  @ViewChild('iframe', { static: false })
  iframeEl: ElementRef;

  baseUrl: string;

  _ngComponentInjector: Injector;
  _ngComponent: Type<any>;
  _ngModule: NgModuleFactory<any>;

  _safeIframeUri: SafeResourceUrl;

  constructor(
    private readonly _elementRef: ElementRef,
    private readonly _cd: ChangeDetectorRef,
    private readonly _render: Renderer2,
    private readonly injector: Injector,
    private readonly ngZone: NgZone,
    private readonly sanitizer: DomSanitizer,
    private readonly compiler: Compiler
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.iframeUri) {
      this._safeIframeUri = this.sanitizer.bypassSecurityTrustResourceUrl(this.iframeUri);
      return;
    }

    if (changes.containers) {
      if (Array.isArray(this.containers)) {
        this.onAddRemoteContainerConfigurations();
      }
    }

    if (changes.container || changes.module) {
      this.onLoadRemoteContainerConfiguration();
    }
  }

  ngAfterViewChecked(): void {
    if (this._safeIframeUri && this.iframeAttrs) {
      try {
              this.updateAttrs(JSON.parse(this.iframeAttrs as unknown as string));
      } finally {

      }
    }
  }

  /**
   *
   */
  onLoadRemoteContainerConfiguration() {
    loadModuleFederatedApp(this.container, this.module)
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
  onAddRemoteContainerConfigurations() {
    addModuleFederatedApps(this.containers);
  }

  onLoadIframeError() {
    this.dispatchError(
      `PluginLauncherIframeLoadingError: Can't fetch resource from ${this.iframeUri}`
    );
  }

  render(resolvedConfiguration: ConfigurationObjectResolve): void {
    const {configuration, configurationModule, module} = resolvedConfiguration;
    const injectorType = configurationModule.type;

    if (this.detectIframe(injectorType)) {
      // if module type is an iframe we should not load one as a remote module
      return this.renderIframe(configuration, configurationModule as IframeRemoteContainerConfigurationModule);
    }

    this.baseUrl = getBaseUrl(configuration.uri);

    const moduleFactory = module[configurationModule.name];

    if (injectorType === InjectorTypes.NgCustomElement) {
      return this.renderCustomElement(moduleFactory);
    }

    if (injectorType === InjectorTypes.NgComponent) {
      this.renderComponent(moduleFactory, configurationModule as NgRemoteContainerConfigurationModule, module);
    }
  }

  private detectIframe(injectorType: string): boolean {
    const isNotIframeType = injectorType !== InjectorTypes.Iframe && !this.iframeUri;

    if (isNotIframeType) {
      this._safeIframeUri = null;
      return false;
    }

    return true;
  }

  private updateAttrs(newValue: Record<string, string | number>, oldValue?: Record<string, string>): void {
    if (!this._safeIframeUri) {
      return;
    }

    if (oldValue) {
      for (const key of Object.keys(oldValue)) {
        this._render.removeAttribute(this.iframeEl.nativeElement, key);
      }
    }

    if (newValue) {
      for (const key of Object.keys(newValue)) {
        this._render.setAttribute(this.iframeEl.nativeElement, key, `${newValue[key]}`);
      }
    }
  }

  private renderIframe(configuration: Partial<RemoteContainerConfiguration>, configurationModule: IframeRemoteContainerConfigurationModule): void {
    const url = `${configuration.uri}${configurationModule.html}`;
    this._safeIframeUri = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

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

    this._render.appendChild(this._elementRef.nativeElement, element);
    this.overrideElementUrls();
  }

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
    this._cd.detectChanges();
  }

  private dispatchError(error: string | Error) {
    const message = typeof error === 'string'
      ? new Error(error)
      : error;

    this.error.emit(message);
  }

  private overrideElementUrls() {
    this.ngZone.runOutsideAngular(() =>
      window.setTimeout(() => {
        overrideElementUrls(this._elementRef.nativeElement, this.baseUrl);
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
