import { ConfigurationObject, RemoteContainerConfigurationModule } from './interface';
import { createRemoteModuleAsync } from './remote-module';
import { findIndexFromEnd } from './util';

/**
 * Returns a specific Configuration Object from COs list by name
 * Is used when we should get a last added CO with a specific name
 */
export function getConfigurationObjectByName(name: string): ConfigurationObject {
  const trimmedName = name.trim();

  const index = findIndexFromEnd(window.mfCOs, ((co) => {
    return co.name.trim() === trimmedName;
  }));

  return window.mfCOs[index];
}

/**
 * Returns a specific Configuration Object from COs list by uuid
 * Is used when CO has identifier, so it means that the one probably is assigned to RCC
 */
export function getConfigurationObjectIndexByUuid(uuid: string): number {
  return findIndexFromEnd(window.mfCOs, ((co) => {
    return co.uuid === uuid;
  }));
}

/**
 * Updates Configuration Object and returns `true` if it's updated
 * In some cases when CO is added but never be resolved (has no Uuid and RCC) we should update it by a provided uri
 * and add some props such as uuid, name and etc
 */
export function updateConfigurationObjectByUri(configurationObject: ConfigurationObject): boolean {
  const trimmedUri = configurationObject.uri.trim();

  const index = findIndexFromEnd(window.mfCOs, ((co) => {
    return co.uri.trim() === trimmedUri;
  }));

  if (index < 0) {
    return false;
  }

  const oldConfigurationObject = window.mfCOs[index];

  window.mfCOs[index] = {
    ...oldConfigurationObject,
    uuid: configurationObject.uuid,
    version: configurationObject.version
  };

  return true;
}

/**
 * Adds Configuration Object with the status that resolves a remote container
 * or returns Configuration Object status if the one was added before
 */
export function resolveConfigurationObject(configurationObject: ConfigurationObject, module: RemoteContainerConfigurationModule): Promise<any> {
  let index = getConfigurationObjectIndexByUuid(configurationObject.uuid);

  const foundConfigurationObject = window.mfCOs[index];

  if (!(foundConfigurationObject.status instanceof Promise)) {
    const configurationObjectWithStatus = {
      ...configurationObject,
      status: createRemoteModuleAsync(configurationObject, module)
    };

    window.mfCOs[index] = configurationObjectWithStatus;
    return configurationObjectWithStatus.status;
  }

  return foundConfigurationObject.status;
}
