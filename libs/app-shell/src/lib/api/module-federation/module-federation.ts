import { RemoteContainerConfiguration } from "./configuration.interface";
import {
  addRemoteContainerConfiguration,
  getRemoteContainerConfigurationModuleByName,
} from "./container-configuration";

import { getConfigurationObjectByName, resolveConfigurationObject} from './configuration-object';

/**
 *
 */
export const loadModuleFederatedApp = async (configurationObjectName: string, remoteModule: string): Promise<any> => {
  const configurationObject = getConfigurationObjectByName(configurationObjectName);

  if (!configurationObject) {
    return Promise.reject(
      `ModuleFederatedAppPreLoadingError: There's no Configuration Object with ${configurationObjectName} name`
    );
  }

  return await resolveConfigurationObject(configurationObject, remoteModule)
    .then((resolvedContainer) => {
      return {
        container: resolvedContainer[configurationObjectName],
        containerConfiguration: getRemoteContainerConfigurationModuleByName(configurationObjectName, remoteModule)
      }
    });
}

/**
 *
 */
export const loadRemoteContainerConfigurationsFromJsonFile = async (request: Request): Promise<void> => {
  const response = await window.fetch(request) as Response;

  if (!response.ok) {
    return Promise.reject(
     `RemoteContainerConfigurationsFromJsonFileLoadingError: An error occurred while loading json file`
    );
  }

  let remoteContainerConfigurations: RemoteContainerConfiguration[];

  try {
    remoteContainerConfigurations = await response.json();
  } catch {
    return Promise.reject(
      `RemoteContainerConfigurationsFromJsonFileParsingError: An error occurred while parsing json file`
    );
  }

  if (!Array.isArray(remoteContainerConfigurations) || remoteContainerConfigurations.length < 1) {
    return Promise.reject(
      `RemoteContainerConfigurationsFromJsonFileReadingError: File contains a wrong value`
    );
  }

  remoteContainerConfigurations.forEach((containerConfiguration) => {
    addRemoteContainerConfiguration(containerConfiguration);
    window.mfCOs.push({
      uri: containerConfiguration.uri,
      name: containerConfiguration.name,
      status: null
    });
  });

  return Promise.resolve();
}