import { ConfigurationObject, RemoteContainerConfigurationModule } from "./interface";
import { createRemoteModuleAsync } from "./remote-module";

/**
 *
 */
export const getConfigurationObjectIndexByUri = (uri: string): number => {
  return window.mfCOs.findIndex((co) => {
    return co.uri.trim() === uri.trim();
  });
}

/**
 *
 */
export const getConfigurationObjectIndexByName = (name: string): number => {
  return window.mfCOs.findIndex((co) => {
    return co.name.trim() === name.trim();
  });
}

/**
 *
 */
export const getConfigurationObjectByName = (name: string): ConfigurationObject => {
  const index = getConfigurationObjectIndexByName(name);
  return window.mfCOs[index];
}

/**
 * Updates Configuration Object and returns `true` if it's updated
 */
 export const updateConfigurationObjectByUri = (configurationObject: ConfigurationObject): boolean => {
  const foundIndex = getConfigurationObjectIndexByUri(configurationObject.uri);

  if (foundIndex > -1) {
    const oldConfigurationObject = window.mfCOs[foundIndex];

    window.mfCOs[foundIndex] = {
      ...oldConfigurationObject,
      ...{
        name: configurationObject.name,
        version: configurationObject.version
      }
    };

    return true;
  }

  return false;
}

/**
 * Adds Configuration Object with the status that resolves a remote container
 * or returns Configuration Object status if it was added before
 */
export const resolveConfigurationObject = (configurationObject: ConfigurationObject, module: RemoteContainerConfigurationModule): Promise<any> => {
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