import { ConfigurationObject, RemoteContainerConfigurationModule } from './interface';
import { createRemoteModuleAsync } from './remote-module';
import { findIndexFromEnd } from './util';

/**
 *
 */
export function getConfigurationObjectIndexByUri(uri: string): number {
  const trimmedUri = uri.trim();

  return findIndexFromEnd(window.mfCOs, ((co) => {
    return co.uri === trimmedUri;
  }));
}

/**
 *
 */
export function getConfigurationObjectIndexByName(name: string): number {
  const trimmedName = name.trim();

  return findIndexFromEnd(window.mfCOs, ((co) => {
    return co.name === trimmedName;
  }));
}

/**
 *
 */
export function getConfigurationObjectByName(name: string): ConfigurationObject {
  const index = getConfigurationObjectIndexByName(name);
  return window.mfCOs[index];
}

/**
 *
 */
 export function getConfigurationObjectIndexByUuid(uuid: string): number {
  return findIndexFromEnd(window.mfCOs, ((co) => {
    return co.uuid === uuid;
  }));
}

/**
 * Updates Configuration Object and returns `true` if it's updated
 */
 export function updateConfigurationObjectByUri(configurationObject: ConfigurationObject): boolean {
  const index = getConfigurationObjectIndexByUri(configurationObject.uri);

  if (index < 0) {
    return false;
  }

  const oldConfigurationObject = window.mfCOs[index];

  window.mfCOs[index] = {
    ...oldConfigurationObject,
    uuid: oldConfigurationObject.uuid || configurationObject.uuid,
    name: configurationObject.name,
    version: configurationObject.version
  };

  return true;
}

/**
 * Adds Configuration Object with the status that resolves a remote container
 * or returns Configuration Object status if it was added before
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
