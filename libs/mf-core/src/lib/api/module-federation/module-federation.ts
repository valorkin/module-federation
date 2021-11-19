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
  getConfigurationObjectIndexByUuid,
  toggleActiveConfigurationObject,
  toggleFailedConfigurationObject,
  deactivateLastActiveConfigurationObjectByName,
  resolveConfigurationObject,
  updateConfigurationObjectByUri,
  getLastActiveConfigurationObjectIndexByName,
  getConfigurationObjectIndexByName
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
  // get an active CO
  let index = getLastActiveConfigurationObjectIndexByName(containerName);

  // or a last added CO
  index = index > -1 ? index : getConfigurationObjectIndexByName(containerName);

  // not found
  if (index === -1) {
    return Promise.reject({
      uuid: null,
      error: new Error(
        `ModuleFederatedAppCONotFoundError: There's no Configuration Object with name ${containerName}`
      )
    });
  }

  let { uuid, definitionUri, active, status } = window.mfCOs[index];

  // Case when a CO is updated and not resolved
  const isNotResolvedConfigurationObject = uuid && definitionUri && !(status instanceof Promise);

  // Case when a CO is added but never be resolved
  const isNotIdentifiedConfigurationObject = !uuid && definitionUri;

  if (isNotIdentifiedConfigurationObject) {
    uuid = uuidv4();
    window.mfCOs[index].uuid = uuid;
  }

  if (isNotResolvedConfigurationObject || isNotIdentifiedConfigurationObject) {
    try {
      await addRemoteContainerConfigurationsByUri(definitionUri);
    } catch (error) {
      return Promise.reject({
        uuid,
        error
      });
    }

    if (active) {
      deactivateLastActiveConfigurationObjectByName(containerName, uuid);
    }
  }

  if (!active) {
    toggleActiveConfigurationObject(uuid, true);
  }

  const containerModule = getRemoteContainerConfigurationModuleByUuid(uuid, moduleName);

  if (!containerModule) {
    return Promise.reject({
      uuid,
      error: new Error(
        `ModuleFederatedRCCNotFoundError: There's no Remote Container Configuration with name ${containerName} and uuid: ${uuid}`
      )
    });
  }

  const configurationObject = window.mfCOs[index];

  try {
    return await resolveConfigurationObject(configurationObject, containerModule)
      .then((resolvedContainer) => {
        return {
          module: resolvedContainer,
          configuration: getRemoteContainerConfigurationByUuid(uuid),
          configurationModule: containerModule
        }
      });
  } catch (error) {
    return Promise.reject({
      uuid,
      error
    });
  }
}

/**
 * Resolves a remote module, synchronizes a resolved one and marks an errored configuration
 */
export async function loadModuleFederatedApp(containerName: string, moduleName: string): Promise<ConfigurationObjectResolve> {
  try {
    return await resolveModuleFederatedApp(containerName, moduleName)
      .then((resolvedData) => {
        const { uuid } = resolvedData.configuration;

        toggleFailedConfigurationObject(uuid, false);
        synchronize();
        return resolvedData;
      });
  } catch (errorData) {
    const { uuid, error } = errorData;

    toggleFailedConfigurationObject(uuid, true);
    synchronize();
    return Promise.reject(error);
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
    const containerWithTrimmedValues = {
      ...trimObjectStringValues(container),
      uuid: uuidv4()
    };

    const uuid = updateConfigurationObjectByUri(containerWithTrimmedValues);

    if (!uuid) {
      window.mfCOs.push({
        uuid: containerWithTrimmedValues.uuid,
        uri: containerWithTrimmedValues.uri,
        name: containerWithTrimmedValues.name,
        active: false,
        hasError: false,
        status: null,
        version: containerWithTrimmedValues.version
      });
    } else {
      containerWithTrimmedValues.uuid = uuid;
    }

    addRemoteContainerConfiguration(containerWithTrimmedValues);
  });
}

/**
 * Adds Configuration Object and resolves its definition uri
 * Is used when Remote Container Configurations should be loaded before Container Injector's requests
 * Is used for asynchronous cases
 */
export async function addModuleFederatedAppAsync(configurationObject: ConfigurationObject): Promise<void> {
  const { name, active } = configurationObject;

  if (active) {
    deactivateLastActiveConfigurationObjectByName(name);
  }

  window.mfCOs = window.mfCOs || [];
  window.mfCOs.push(configurationObject);
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
}
