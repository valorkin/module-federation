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
  markConfigurationObjectPriority
} from '@mf/core';

import { ContainersObserver } from '../observers/containers.observer';
import { ContainersWindowCrossDomainObserver } from '../observers/cross-window.observer';

enum ContainerEvents {
  AllUpdated = 'mf-ext-configuration-objects-updated',
}

enum ContainerCrossDomainEvents {
  Add = 'mf-ext-add-configuration-object',
  Update = 'mf-ext-update-configuration-object',
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
    private containersObserver: ContainersObserver,
    private windowObserver: ContainersWindowCrossDomainObserver
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
  public on(uuid: string, fn: () => {}): Subscription {
    return this.containersObserver.on(uuid, fn);
  }

  /**
   *
   */
  public off(uuid: string, subscription: Subscription) {
    this.containersObserver.off(uuid, subscription);

    if (!this.containersObserver.has(uuid)) {
      this.updatePriority(uuid, ConfigurationObjectPriorities.Inactive);
    }
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
    addConfigurationObject(configurationObject);

    if (configurationObject.priority === ConfigurationObjectPriorities.Active) {
      this.containersObserver.dispatchAll(configurationObject);
    }

    this.broadcast();
  }

  /**
   *
   */
  private onUpdate(configurationObject: ConfigurationObject) {
    updateConfigurationObject(configurationObject);
    this.containersObserver.dispatch(configurationObject.uuid, configurationObject);
    this.broadcast();
  }
}
