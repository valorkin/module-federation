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
  markConfigurationObjectPriority,
  deactivateLastActiveConfigurationObjectByName,
  resolveConfigurationObject,
  updateConfigurationObjectByUri,
  getActiveConfigurationObjectIndexByName,
  getConfigurationObjectIndexByName
} from './configuration-object';

import { trimObjectStringValues, uuidv4, fetchByUri } from './util';
import { synchronize } from './synchronization';
import { ConfigurationObjectPriorities } from '.';

/**
 * Loads Remote Container Configurations from a json file, adds them
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
  let index = getActiveConfigurationObjectIndexByName(containerName);

  // or a last added CO
  index = index > -1 ? index : getConfigurationObjectIndexByName(containerName);

  // not found
  if (index < 0) {
    return Promise.reject({
      uuid: null,
      error: new Error(
        `ModuleFederatedAppCONotFoundError: There's no Configuration Object with name ${containerName}`
      )
    });
  }

  let { uuid, definitionUri, priority, status } = window.mfCOs[index];

  // Case when a CO is updated and not resolved
  const isNotResolvedConfigurationObject = uuid && definitionUri && !(status instanceof Promise);

  // Case when a CO is added but never be resolved
  const isNotIdentifiedConfigurationObject = (priority === ConfigurationObjectPriorities.Initialized && definitionUri);

  if (!uuid) {
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

    if (priority === ConfigurationObjectPriorities.Active) {
      deactivateLastActiveConfigurationObjectByName(containerName, uuid);
    }
  }

  if (priority !== ConfigurationObjectPriorities.Active) {
    window.mfCOs[index].priority = ConfigurationObjectPriorities.Active;
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

        markConfigurationObjectPriority(uuid, ConfigurationObjectPriorities.Active);
        synchronize();
        return resolvedData;
      });
  } catch (errorData) {
    const { uuid, error } = errorData;

    markConfigurationObjectPriority(uuid, ConfigurationObjectPriorities.Error);
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

    // if a CO exists and indentified
    const uuid = updateConfigurationObjectByUri(containerWithTrimmedValues);

    if (!uuid) {
      window.mfCOs.push({
        // use currently created uuid
        uuid: containerWithTrimmedValues.uuid,
        uri: containerWithTrimmedValues.uri,
        name: containerWithTrimmedValues.name,
        priority: ConfigurationObjectPriorities.Initialized,
        status: null,
        version: containerWithTrimmedValues.version
      });
    } else {
      // use previously created uuid
      containerWithTrimmedValues.uuid = uuid;
    }

    addRemoteContainerConfiguration(containerWithTrimmedValues);
  });
}
