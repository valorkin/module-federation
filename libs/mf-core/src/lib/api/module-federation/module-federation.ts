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
  getActiveConfigurationObjectByName,
  getConfigurationObjectByName,
  getConfigurationObjectIndexByUuid,
  toggleActiveConfigurationObject,
  toggleFailedConfigurationObject,
  deactivateLastActiveConfigurationObjectByName,
  resolveConfigurationObject,
  updateConfigurationObjectByUri
} from './configuration-object';

import { trimObjectStringValues, uuidv4, fetchByUri } from './util';
import { synchronize } from './synchronization';

/**
 * Loads Remote Container Configurations from a json file and adds Remote Container Configurations
 * and Configuration Objects to the lists by a uri
 */
async function addRemoteContainerConfigurationsByUri(uri: string): Promise<void> {
  try {
    await fetchByUri(uri)
      .then((response) => response.json())
      .then((containers) => addModuleFederatedApps(containers));
  } catch (e) {
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
async function resolveModuleFederatedApp(containerName: string, moduleName: string) {
  // get an active or a last added CO
  let configurationObject = getActiveConfigurationObjectByName(containerName) || getConfigurationObjectByName(containerName);

  if (!configurationObject) {
    return Promise.reject(
      new Error(
        `ModuleFederatedAppCONotFoundError: There's no Configuration Object with name ${containerName}`
      )
    );
  }

  let { uuid, definitionUri, active, hasError } = configurationObject;

  // Case when a CO is not resolved and was added synchronously by `window.mfCOs.push()`
  if (!uuid && definitionUri) {
    try {
      await addRemoteContainerConfigurationsByUri(definitionUri);
    } catch (e) {
      toggleFailedConfigurationObject(configurationObject, true);
      return Promise.reject(e);
    }

    configurationObject = getActiveConfigurationObjectByName(containerName) || getConfigurationObjectByName(containerName);
    uuid = configurationObject.uuid;

    if (active) {
      deactivateLastActiveConfigurationObjectByName(containerName, uuid);
    }

    if (hasError) {
      toggleFailedConfigurationObject(uuid, false);
    }
  }

  if (!active) {
    toggleActiveConfigurationObject(uuid, true);
  }

  const containerModule = getRemoteContainerConfigurationModuleByUuid(uuid, moduleName);

  if (!containerModule) {
    toggleFailedConfigurationObject(configurationObject, true);

    return Promise.reject(
      new Error(
        `ModuleFederatedRCCNotFoundError: There's no Remote Container Configuration with name ${containerName} and uuid: ${uuid}`
      )
    );
  }

  try {
    return await resolveConfigurationObject(configurationObject, containerModule)
      .then((resolvedContainer) => {
        toggleFailedConfigurationObject(uuid, false);

        return {
          module: resolvedContainer,
          configuration: getRemoteContainerConfigurationByUuid(uuid),
          configurationModule: containerModule
        }
      });
  } catch (e) {
    toggleFailedConfigurationObject(uuid, true);
    return Promise.reject(e);
  }
}

/**
 * Resolves a remote module by its container and module name
 */
export async function loadModuleFederatedApp(containerName: string, moduleName: string): Promise<ConfigurationObjectResolve> {
  try {
    return await resolveModuleFederatedApp(containerName, moduleName)
      .then((resolvedData) => {
        synchronize();
        return resolvedData;
      });
  } catch (e) {
    synchronize();
    return Promise.reject(e);
  }
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
        active: false,
        hasError: false,
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
export async function addModuleFederatedAppAsync(configurationObject: ConfigurationObject): Promise<void> {
  const { name, definitionUri, active } = configurationObject;

  if (active) {
    deactivateLastActiveConfigurationObjectByName(name);
  }

  window.mfCOs = window.mfCOs || [];
  window.mfCOs.push(configurationObject);

  if (active && definitionUri) {
    const index = window.mfCOs.length - 1;

    return await addRemoteContainerConfigurationsByUri(definitionUri)
      .catch(() => {
        window.mfCOs[index].hasError = true;
      });
  }
}

/**
 * Updates Configuration Object and resolves its definition uri
 * Is used when Configuration Object should be updated before Container Injector's requests
 * Is used for asynchronous cases
 */
export async function updateModuleFederatedAppAsync(configurationObject: ConfigurationObject): Promise<void> {
  const { uri, name, uuid, definitionUri, active } = configurationObject;
  const index = getConfigurationObjectIndexByUuid(uuid);

  if (index < 0) {
    return Promise.reject(
      new Error(
        `ModuleFederatedAppCOUpdateError: There's no Configuration Object with ${name} and uuid: ${uuid}`
      )
    );
  }

  const { uri: oldUri, definitionUri: oldDefinitionUri } = window.mfCOs[index];

  if (uri !== oldUri || definitionUri !== oldDefinitionUri) {
    configurationObject.status = null;
  }

  if (active) {
    deactivateLastActiveConfigurationObjectByName(name);
  }

  window.mfCOs[index] = configurationObject;
  // window.mfCOs[index].hasError = false;

  if (active && definitionUri !== oldDefinitionUri) {
    return await addRemoteContainerConfigurationsByUri(definitionUri)
      .catch(() => {
        window.mfCOs[index].hasError = true;
      });
  }
}
