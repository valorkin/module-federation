import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

import {
  ConfigurationObject,
  ConfigurationObjectResolve,
  ConfigurationObjectPriorities,
  loadModuleFederatedApp,
  transfromSafeConfigurationObjects,
  addConfigurationObject,
  updateConfigurationObject,
  markConfigurationObjectPriority,
  getConfigurationObjectIndexByUuid
} from '@mf/core';

import { ContainersWindowCrossDomainObserver } from '../observers/cross-window.observer';
import { ContainerComponentsService } from './container-components.service';

enum ContainerEvents {
  AllUpdated = 'mf-ext-configuration-objects-updated',
}

enum ContainerCrossDomainEvents {
  Add = 'mf-ext-add-configuration-object',
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
  private onCreate(configurationObject: ConfigurationObject) {
    const {name, priority} = configurationObject;

    addConfigurationObject(configurationObject);

    if (priority === ConfigurationObjectPriorities.Active) {
      this.containerComponentsService.runByName(name);
    }

    this.broadcast();
  }

  /**
   *
   */
  private onUpdate(configurationObject: ConfigurationObject) {
    const {name, priority} = configurationObject;

    updateConfigurationObject(configurationObject);

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
    const {name} = configurationObject;

    updateConfigurationObject(configurationObject);
    this.containerComponentsService.runByName(name);
    this.broadcast();
  }
}
