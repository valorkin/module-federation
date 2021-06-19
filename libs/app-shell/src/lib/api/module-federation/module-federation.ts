import { RemoteContainerConfiguration, ConfigurationObjectResolve } from "./interface";
import {
  addRemoteContainerConfiguration,
  getRemoteContainerConfigurationByName,
  getRemoteContainerConfigurationModuleByName
} from "./container-configuration";
import { getConfigurationObjectByName, resolveConfigurationObject} from './configuration-object';

/**
 *
 */
export const loadModuleFederatedApp = async (configurationObjectName: string, moduleName: string): Promise<ConfigurationObjectResolve> => {
  const configurationObject = getConfigurationObjectByName(configurationObjectName);

  if (!configurationObject) {
    return Promise.reject(
      new Error(
        `ModuleFederatedAppPreLoadingError: There's no Configuration Object with ${configurationObjectName} name`
      )
    );
  }

  const resolvedConfiguration = await resolveConfigurationObject(configurationObject, moduleName)
    .then((resolvedContainer) => {
      return {
        module: resolvedContainer,
        configuration: getRemoteContainerConfigurationByName(configurationObjectName),
        configurationModule: getRemoteContainerConfigurationModuleByName(configurationObjectName, moduleName)
      }
    }) as ConfigurationObjectResolve;

  if (!resolvedConfiguration) {
    return Promise.reject(
      new Error(
        `ModuleFederatedAppPostLoadingError: An error occurred while loading or resolving Configuration Object with ${configurationObjectName} name`
      )
    );
  }

  return resolvedConfiguration;
}

/**
 *
 */
export const loadRemoteContainerConfigurationsFromJsonFile = async (request: Request): Promise<void> => {
  const response = await window.fetch(request) as Response;

  if (!response.ok) {
    return Promise.reject(
      new Error(
        `RemoteContainerConfigurationsFromJsonFileLoadingError: An error occurred while loading ${request.url} file`
      )
    );
  }

  let remoteContainerConfigurations: RemoteContainerConfiguration[];

  try {
    remoteContainerConfigurations = await response.json();
  } catch {
    return Promise.reject(
      new Error(
        `RemoteContainerConfigurationsFromJsonFileParsingError: An error occurred while parsing ${request.url} file`
      )
    );
  }

  if (!Array.isArray(remoteContainerConfigurations) || remoteContainerConfigurations.length < 1) {
    return Promise.reject(
      new Error(
        `RemoteContainerConfigurationsFromJsonFileReadingError: File ${request.url} contains an invalid value`
      )
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
}