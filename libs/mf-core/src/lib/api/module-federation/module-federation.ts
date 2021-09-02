import { RemoteContainerConfiguration, ConfigurationObjectResolve } from './interface';

import {
  addRemoteContainerConfiguration,
  getRemoteContainerConfigurationByName,
  getRemoteContainerConfigurationModuleByName
} from './container-configuration';

import {
  getConfigurationObjectByName,
  resolveConfigurationObject,
  updateConfigurationObjectByUri
} from './configuration-object';

import { trimObjectStringValues } from './util';

/**
 * Resolves a remote module by its container and module name
 */
export async function loadModuleFederatedApp(containerName: string, moduleName: string): Promise<ConfigurationObjectResolve> {
  const configurationObject = getConfigurationObjectByName(containerName);

  if (!configurationObject) {
    return Promise.reject(
      new Error(
        `ModuleFederatedAppCONotFoundError: There's no Configuration Object with name ${containerName}`
      )
    );
  }

  const containerModule = getRemoteContainerConfigurationModuleByName(containerName, moduleName);

  if (!containerModule) {
    return Promise.reject(
      new Error(
        `ModuleFederatedRCCNotFoundError: There's no Remote Container Configuration with name ${containerName}`
      )
    );
  }

  const resolvedConfiguration = await resolveConfigurationObject(configurationObject, containerModule)
    .then((resolvedContainer) => {
      return {
        module: resolvedContainer,
        configuration: getRemoteContainerConfigurationByName(containerName),
        configurationModule: containerModule
      }
    }) as ConfigurationObjectResolve;

  if (!resolvedConfiguration) {
    return Promise.reject(
      new Error(
        `ModuleFederatedAppLoadingError: An error occurred while loading or resolving Configuration Object with name ${containerName}`
      )
    );
  }

  return resolvedConfiguration;
}

/**
 * Adds Remote Container Configurations and Configuration Objects to be resolved in a future
 */
export function addModuleFederatedApps(containers: RemoteContainerConfiguration[]) {
  if (!Array.isArray(containers) || containers.length < 1) {
    return;
  }

  containers.forEach((container) => {
    const containerWithTrimmedValues = trimObjectStringValues(container);

    addRemoteContainerConfiguration(containerWithTrimmedValues);

    if (!updateConfigurationObjectByUri(containerWithTrimmedValues)) {
      window.mfCOs.push({
        uri: containerWithTrimmedValues.uri,
        name: containerWithTrimmedValues.name,
        status: null,
        version: containerWithTrimmedValues.version
      });
    }
  });
}