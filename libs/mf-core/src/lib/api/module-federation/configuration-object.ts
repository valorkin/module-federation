import { ConfigurationObject, RemoteContainerConfigurationModule } from './interface';
import { createRemoteModuleAsync } from './remote-module';

/**
 *
 */
export function getConfigurationObjectIndexByUri(uri: string): number {
  const trimmedUri = uri.trim();

  return window.mfCOs.findIndex((co) => {
    return co.uri === trimmedUri;
  });
}

/**
 *
 */
export function getConfigurationObjectIndexByName(name: string): number {
  const trimmedName = name.trim();

  return window.mfCOs.findIndex((co) => {
    return co.name === trimmedName;
  });
}

/**
 *
 */
export function getConfigurationObjectByName(name: string): ConfigurationObject {
  const index = getConfigurationObjectIndexByName(name);
  return window.mfCOs[index];
}

/**
 * Updates Configuration Object and returns `true` if it's updated
 */
 export function updateConfigurationObjectByUri(configurationObject: ConfigurationObject): boolean {
  const foundIndex = getConfigurationObjectIndexByUri(configurationObject.uri);

  if (foundIndex < 0) {
    return false;
  }

  const oldConfigurationObject = window.mfCOs[foundIndex];

  window.mfCOs[foundIndex] = {
    ...oldConfigurationObject,
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
  let foundConfigurationObjectIndex = getConfigurationObjectIndexByUri(configurationObject.uri);

  const foundConfigurationObject = window.mfCOs[foundConfigurationObjectIndex];

  if (!foundConfigurationObject) {
    window.mfCOs.push(configurationObject);
    foundConfigurationObjectIndex = window.mfCOs.length - 1;
  }

  if (!(foundConfigurationObject.status instanceof Promise)) {
    const configurationObjectWithStatus = {
      ...configurationObject,
      status: createRemoteModuleAsync(configurationObject, module)
    };
    window.mfCOs[foundConfigurationObjectIndex] = configurationObjectWithStatus;
    return configurationObjectWithStatus.status;
  }

  return foundConfigurationObject.status;
}