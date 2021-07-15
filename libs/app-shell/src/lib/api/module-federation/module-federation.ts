import { RemoteContainerConfiguration, ConfigurationObjectResolve } from "./interface";

import {
  addRemoteContainerConfiguration,
  getRemoteContainerConfigurationByName,
  getRemoteContainerConfigurationModuleByName
} from "./container-configuration";

import {
  getConfigurationObjectByName,
  resolveConfigurationObject,
  updateConfigurationObjectByUri
} from './configuration-object';

/**
 *
 */
export const loadModuleFederatedApp = async (configurationObjectName: string, moduleName: string): Promise<ConfigurationObjectResolve> => {
  const configurationObject = getConfigurationObjectByName(configurationObjectName);

  if (!configurationObject) {
    return Promise.reject(
      new Error(
        `ModuleFederatedAppCONotFoundError: There's no Configuration Object with name ${configurationObjectName}`
      )
    );
  }

  const configurationModule = getRemoteContainerConfigurationModuleByName(configurationObjectName, moduleName);

  if (!configurationModule) {
    return Promise.reject(
      new Error(
        `ModuleFederatedRCCNotFoundError: There's no Remote Container Configuration with name ${configurationObjectName}`
      )
    );
  }

  const resolvedConfiguration = await resolveConfigurationObject(configurationObject, configurationModule)
    .then((resolvedContainer) => {
      return {
        module: resolvedContainer,
        configuration: getRemoteContainerConfigurationByName(configurationObjectName),
        configurationModule
      }
    }) as ConfigurationObjectResolve;

  if (!resolvedConfiguration) {
    return Promise.reject(
      new Error(
        `ModuleFederatedAppLoadingError: An error occurred while loading or resolving Configuration Object with name ${configurationObjectName}`
      )
    );
  }

  return resolvedConfiguration;
}

/**
 *
 */
export const addModuleFederatedApps = (containerConfigurations: RemoteContainerConfiguration[]) => {
  if (!Array.isArray(containerConfigurations) || containerConfigurations.length < 1) {
    return;
  }

  containerConfigurations.forEach((containerConfiguration) => {
    addRemoteContainerConfiguration(containerConfiguration);

    if (!updateConfigurationObjectByUri(containerConfiguration)) {
      window.mfCOs.push({
        uri: containerConfiguration.uri,
        name: containerConfiguration.name,
        status: null,
        version: containerConfiguration.version
      });
    }
  });
}