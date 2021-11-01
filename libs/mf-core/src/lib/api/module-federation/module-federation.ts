import {
  RemoteContainerConfiguration,
  ConfigurationObjectResolve,
  ConfigurationObject
} from './interface';

import {
  addRemoteContainerConfiguration,
  getRemoteContainerConfigurationByUuid,
  getRemoteContainerConfigurationModuleByUuid
} from './container-configuration';

import {
  getConfigurationObjectByName,
  getConfigurationObjectIndexByUuid,
  resolveConfigurationObject,
  updateConfigurationObjectByUri
} from './configuration-object';

import { trimObjectStringValues, uuidv4, fetchByUri } from './util';

/**
 * Loads Remote Container Configurations from a json file and adds Remote Container Configurations
 * and Configuration Objects to the lists by a uri
 */
async function addRemoteContainerConfigurationsByUri(uri: string): Promise<void> {
  try {
    await fetchByUri(uri)
      .then((response) => response.json())
      .then((containers) => addModuleFederatedApps(containers))

    window.mfCore.hooks.containers.loaded();
  } catch (e) {
    window.mfCore.hooks.containers.aborted();

    return Promise.reject(
      new Error(
        `ModuleFederatedRCCFileLoadingError: An error occurred while loading Remote Container Configurations from ${uri}`
      )
    );
  }
}

/**
 * Resolves a remote module by its container and module name
 */
export async function loadModuleFederatedApp(containerName: string, moduleName: string): Promise<ConfigurationObjectResolve> {
  let configurationObject = getConfigurationObjectByName(containerName);

  if (!configurationObject) {
    return Promise.reject(
      new Error(
        `ModuleFederatedAppCONotFoundError: There's no Configuration Object with name ${containerName}`
      )
    );
  }

  const definitionUri = configurationObject.definitionUri;
  let containerUuid = configurationObject.uuid;

  // Case when a CO is not resolved and was added synchronously using `window.mfCOs.push()`
  if (!containerUuid && definitionUri) {
    try {
      await addRemoteContainerConfigurationsByUri(definitionUri);
    } catch (e) {
      return Promise.reject(e);
    }

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

/**
 * Adds Configuration Object and resolves its definition uri
 * Is used when Remote Container Configurations should be loaded before Container Injector's requests
 * Is used for asynchronous cases
 */
 export async function addModuleFederatedAppsAsync(configurationObject: ConfigurationObject): Promise<void> {
  const { definitionUri } = configurationObject;

  window.mfCOs = window.mfCOs || [];
  window.mfCOs.push(configurationObject);

  if (definitionUri) {
    try {
      await addRemoteContainerConfigurationsByUri(definitionUri);
    } catch (e) {
      return Promise.reject(e);
    }
  }
}

/**
 * Updates Configuration Object and resolves its definition uri
 * Is used when Configuration Object should be updated before Container Injector's requests
 * Is used for asynchronous cases
 */
export async function updateModuleFederatedAppsAsync(configurationObject: ConfigurationObject): Promise<void> {
  const { name, uuid, definitionUri } = configurationObject;
  const index = getConfigurationObjectIndexByUuid(configurationObject.uuid);

  if (index < 0) {
    return Promise.reject(
      new Error(
        `ModuleFederatedAppCOUpdateError: There's no Configuration Object with ${name} and uuid: ${uuid}`
      )
    );
  }

  window.mfCOs.splice(index, 1);
  window.mfCOs.push(configurationObject);

  if (definitionUri) {
    try {
      await addRemoteContainerConfigurationsByUri(definitionUri);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  window.mfCore.hooks.configurations.updated();
}
