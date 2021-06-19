import { ConfigurationObject } from "./interface";
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
 *
 */
export const resolveConfigurationObject = (configurationObject: ConfigurationObject, moduleName: string): Promise<any> => {
  let foundConfigurationObjectIndex = getConfigurationObjectIndexByUri(configurationObject.uri);

  const foundConfigurationObject = window.mfCOs[foundConfigurationObjectIndex];

  if (!foundConfigurationObject) {
    window.mfCOs.push(configurationObject);
    foundConfigurationObjectIndex = window.mfCOs.length - 1;
  }

  if (!(foundConfigurationObject.status instanceof Promise)) {
    const configurationObjectWithStatus = {
      ...configurationObject,
      status: createRemoteModuleAsync(configurationObject, moduleName)
    };
    window.mfCOs[foundConfigurationObjectIndex] = configurationObjectWithStatus;
    return configurationObjectWithStatus.status;
  }

  return foundConfigurationObject.status;
}