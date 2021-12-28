import { Injectable } from '@angular/core';

import {
  ConfigurationObject,
  ConfigurationObjectResolve,
  ConfigurationObjectPriorities,
  loadModuleFederatedApp,
  transfromSafeConfigurationObjects,
  addConfigurationObject,
  addRemoteContainerConfigurationsByUri,
  updateConfigurationObject,
  markConfigurationObjectPriority
} from '@mf/core';

import { ContainersWindowCrossDomainObserver } from '../observers/cross-window.observer';
import { ContainerComponentsService } from './container-components.service';

enum ContainerEvents {
  AllUpdated = 'mf-ext-configuration-objects-updated',
}

enum ContainerCrossDomainEvents {
  Add = 'mf-ext-add-configuration-object',
  AddByUri = 'mf-ext-add-configuration-objects-by-uri',
  Clone = 'mf-ext-clone-configuration-object',
  Update = 'mf-ext-update-configuration-object',
  Switch = 'mf-ext-switch-configuration-object',
  PopupOpened = 'mf-ext-popup-opened'
}

/**
 *
 */
@Injectable({
  providedIn: 'root'
})
export class ContainersService {
  constructor(
    private readonly windowObserver: ContainersWindowCrossDomainObserver,
    private readonly containerComponentsService: ContainerComponentsService
  ) {
    //
    this.windowObserver.on(ContainerCrossDomainEvents.PopupOpened, () => {
      this.broadcast();
    });

    //
    this.windowObserver.on(ContainerCrossDomainEvents.Add, (configurationObject) => {
      this.onCreate(configurationObject);
    });

    //
    this.windowObserver.on(ContainerCrossDomainEvents.AddByUri, (uri) => {
      this.onCreateByUri(uri);
    });

    //
    this.windowObserver.on(ContainerCrossDomainEvents.Clone, (configurationObject) => {
      this.onClone(configurationObject);
    });

    //
    this.windowObserver.on(ContainerCrossDomainEvents.Update, (configurationObject) => {
      this.onUpdate(configurationObject);
    });

    //
    this.windowObserver.on(ContainerCrossDomainEvents.Switch, (configurationObject) => {
      this.onSwitch(configurationObject);
    });
  }

  /**
   *
   */
  public resolve(container: string, module: string): Promise<ConfigurationObjectResolve> {
    return loadModuleFederatedApp(container, module);
  }

  /**
   *
   */
  public broadcast() {
    this.windowObserver.dispatch(
      ContainerEvents.AllUpdated,
      transfromSafeConfigurationObjects(window.mfCOs)
    );
  }

  /**
   *
   */
  public updatePriority(uuid: string, priority: ConfigurationObjectPriorities) {
    markConfigurationObjectPriority(uuid, priority);
    this.broadcast();
  }

  /**
   *
   */
  public unuse(uuid: string) {
    if (this.containerComponentsService.findByUuid(uuid)) {
      return;
    }

    this.updatePriority(uuid, ConfigurationObjectPriorities.Inactive);
  }

  /**
   *
   */
  private onCreate(configurationObject: ConfigurationObject) {
    const {name, priority} = configurationObject;

    addConfigurationObject(configurationObject);

    if (priority === ConfigurationObjectPriorities.Active) {
      if (this.deactivateWhenUnused(configurationObject)) {
        return;
      }

      this.containerComponentsService.runByName(name);
    }

    this.broadcast();
  }

  /**
   *
   */
  private async onCreateByUri(uri: string) {
    try {
      await addRemoteContainerConfigurationsByUri(uri);
      this.broadcast();
    } catch (error) {
      console.log(error);
    }
  }

  /**
   *
   */
  private onClone(configurationObject: ConfigurationObject) {
    configurationObject.uuid = null;
    configurationObject.priority = ConfigurationObjectPriorities.Initialized;

    addConfigurationObject(configurationObject);
    this.broadcast();
  }

  /**
   *
   */
  private onUpdate(configurationObject: ConfigurationObject) {
    const {name, priority} = configurationObject;

    updateConfigurationObject(configurationObject);

    if (priority === ConfigurationObjectPriorities.Active) {
      if (this.deactivateWhenUnused(configurationObject)) {
        return;
      }
    }

    if (priority !== ConfigurationObjectPriorities.Initialized) {
      this.containerComponentsService.runByContainer(configurationObject);
    } else {
      this.containerComponentsService.runByName(name);
    }

    this.broadcast();
  }

 /**
  *
  */
  private onSwitch(configurationObject: ConfigurationObject) {
    const {name, priority} = configurationObject;

    updateConfigurationObject(configurationObject);

    if (priority === ConfigurationObjectPriorities.Active) {
      if (this.deactivateWhenUnused(configurationObject)) {
        return;
      }
    }

    this.containerComponentsService.runByName(name);
    this.broadcast();
  }

  /**
   *
   */
  private deactivateWhenUnused(configurationObject: ConfigurationObject): boolean {
    const {uuid, name} = configurationObject;

    const componentThatUsesConfiguration = this.containerComponentsService.some((component) => {
      return component.container === name || component.containerUuid === uuid;
    });

    if (!componentThatUsesConfiguration) {
      this.updatePriority(uuid, ConfigurationObjectPriorities.Inactive);
      return true;
    }

    return false;
  }
}
