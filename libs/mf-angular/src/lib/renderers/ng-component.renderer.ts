import { ElementRef, Injectable, Injector, ComponentFactoryResolver, Compiler } from '@angular/core';
import { ConfigurationObjectResolve, ConfigurationObjectPriorities, NgRemoteContainerConfigurationModule } from '@mf/core';
import { ContainersService } from '../services/containers.service';
import { ElementUrlsOverriderService } from '../services/urls-overrider.service';
import { RendererRef, NgParentComponentRef, NgRendererContext } from './interface';
import { REMOTE_BASE_URL } from '../tokens';

/**
 *
 */
 @Injectable()
 export class NgComponentRendererRef implements RendererRef {
  constructor(
    private readonly compiler: Compiler,
    private readonly containersService: ContainersService,
    private readonly elementUrlsOverriderService: ElementUrlsOverriderService
  ) {}

  /**
   *
   */
  public async render(resolvedConfiguration: ConfigurationObjectResolve, parentComponentRef: NgParentComponentRef): Promise<NgRendererContext> {
    const {configurationModule, module} = resolvedConfiguration;
    let {name, component} = configurationModule as NgRemoteContainerConfigurationModule;

    parentComponentRef.viewContainerRef.clear();

    const injector = this.createInjector(parentComponentRef);
    let moduleRef = null;

    // if provided module name and component name we bootstrap both
    if (name && component) {
      try {
        const moduleClass = module[name];
        const moduleFactory = await this.compiler.compileModuleAsync(moduleClass);
        moduleRef = moduleFactory.create(injector);
      } catch {
        this.containersService.updatePriority(parentComponentRef.containerUuid, ConfigurationObjectPriorities.Error);
      }
    }

    // if component name is not provided, we suppose that `name` is a component name
    component = !component ? name : component;

    const componentClass = module[component];

    // check if component is a function
    const isComponentClassDefined = typeof componentClass === 'function';

    if (!isComponentClassDefined) {
      this.containersService.updatePriority(parentComponentRef.containerUuid, ConfigurationObjectPriorities.Error);

      return parentComponentRef.dispatchError(
        `ContainerInjectorComponentResolveError: Can't resolve a component with name ${component}`
      );
    }

    const componentFactoryResolver = moduleRef
      ? moduleRef.componentFactoryResolver
      : parentComponentRef.injector.get(ComponentFactoryResolver);

    const componentFactory = componentFactoryResolver.resolveComponentFactory(componentClass);
    const componentRef = parentComponentRef.viewContainerRef.createComponent(componentFactory, 0, injector);
    const elementRef = componentRef.injector.get(ElementRef);

    this.elementUrlsOverriderService.override(elementRef.nativeElement, parentComponentRef.baseUrl);
    parentComponentRef.changeDetectorRef.detectChanges();

    return {
      moduleRef,
      viewContainerRef: parentComponentRef.viewContainerRef
    };
  }

  /**
   *
   */
  public destroy(context: NgRendererContext) {
    context?.moduleRef?.destroy();
    context?.viewContainerRef?.clear();
  }

  /**
   *
   */
  private createInjector(componentRef: NgParentComponentRef) {
    return Injector.create({
      providers: [
        {
          provide: REMOTE_BASE_URL,
          deps: [],
          useValue: componentRef.baseUrl
        },
      ],
      parent: componentRef.injector
    });
  }
 }
