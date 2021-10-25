import { RemoteContainerConfiguration, ConfigurationObjectResolve } from './interface';

import {
  addRemoteContainerConfiguration,
  getRemoteContainerConfigurationByUuid,
  getRemoteContainerConfigurationModuleByUuid,
  loadRemoteContainerConfigurationsFile
} from './container-configuration';

import {
  getConfigurationObjectByName,
  resolveConfigurationObject,
  updateConfigurationObjectByUri
} from './configuration-object';

import { trimObjectStringValues, uuidv4 } from './util';

/**
 * Resolves a remote module by its container and module name
 */
export async function loadModuleFederatedApp(containerName: string, moduleName: string): Promise<ConfigurationObjectResolve> {
  let configurationObject = getConfigurationObjectByName(containerName);
  let containerUuid = configurationObject.uuid;

  if (!configurationObject) {
    return Promise.reject(
      new Error(
        `ModuleFederatedAppCONotFoundError: There's no Configuration Object with name ${containerName} and uuid: ${containerUuid}`
      )
    );
  }

  const definitionUri = configurationObject.definitionUri;

  if (!containerUuid && definitionUri) {
    const containers = await loadRemoteContainerConfigurationsFile(definitionUri);

    if (!containers) {
      return Promise.reject(
        new Error(
          `ModuleFederatedRCCFileLoadingError: An error occurred while loading Remote Container Configurations from ${definitionUri} for ${containerName} and uuid: ${containerUuid}`
        )
      );
    }

    addModuleFederatedApps(containers);
    configurationObject = getConfigurationObjectByName(containerName);
    containerUuid = configurationObject.uuid;
  }

  const containerModule = getRemoteContainerConfigurationModuleByUuid(containerUuid, moduleName);

  if (!containerModule) {
    return Promise.reject(
      new Error(
        `ModuleFederatedRCCNotFoundError: There's no Remote Container Configuration with name ${containerName} and uuid: ${containerUuid}`
      )
    );
  }

  const resolvedConfiguration = await resolveConfigurationObject(configurationObject, containerModule)
    .then((resolvedContainer) => {
      return {
        module: resolvedContainer,
        configuration: getRemoteContainerConfigurationByUuid(containerUuid),
        configurationModule: containerModule
      }
    }) as ConfigurationObjectResolve;

  if (!resolvedConfiguration) {
    return Promise.reject(
      new Error(
        `ModuleFederatedAppLoadingError: An error occurred while loading or resolving Configuration Object with name ${containerName} and uuid: ${containerUuid}`
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
    const uuid = uuidv4();
    const containerWithTrimmedValues = {
      ...trimObjectStringValues(container),
      uuid
    };

    addRemoteContainerConfiguration(containerWithTrimmedValues);

    if (!updateConfigurationObjectByUri(containerWithTrimmedValues)) {
      window.mfCOs.push({
        uuid,
        uri: containerWithTrimmedValues.uri,
        name: containerWithTrimmedValues.name,
        status: null,
        version: containerWithTrimmedValues.version
      });
    }
  });
}
