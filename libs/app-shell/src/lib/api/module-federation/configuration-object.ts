import { ConfigurationObject } from "./configuration.interface";
import { createRemoteModuleAsync } from "./remote-module";

const createConfigurationObjectAsync = (configurationObject: ConfigurationObject, module: string): ConfigurationObject => {
  const configurationObjectWithStatus = {
    ...configurationObject,
    status: createRemoteModuleAsync(configurationObject, module)
  };

  return configurationObjectWithStatus;
}

export const getConfigurationObjectIndexByUri = (uri: string): number => {
  return window.mfCOs.findIndex((co) => {
    return co.uri.trim() === uri.trim();
  });
}

export const getConfigurationObjectIndexByName = (name: string): number => {
  return window.mfCOs.findIndex((co) => {
    return co.name.trim() === name.trim();
  });
}

export const getConfigurationObjectByName = (name: string): ConfigurationObject => {
  const index = getConfigurationObjectIndexByName(name);
  return window.mfCOs[index];
}

export const resolveConfigurationObject = (configurationObject: ConfigurationObject, remoteModule: string): Promise<any> => {
  let foundConfigurationObjectIndex = getConfigurationObjectIndexByUri(configurationObject.uri);

  const foundConfigurationObject = window.mfCOs[foundConfigurationObjectIndex];

  if (!foundConfigurationObject) {
    window.mfCOs.push(configurationObject);
    foundConfigurationObjectIndex = window.mfCOs.length - 1;
  }

  let configurationObjectWithStatus: ConfigurationObject;

  if (!(foundConfigurationObject.status instanceof Promise)) {
    configurationObjectWithStatus = createConfigurationObjectAsync(configurationObject, remoteModule);
    window.mfCOs[foundConfigurationObjectIndex] = configurationObjectWithStatus;
  }

  return configurationObjectWithStatus.status;
}