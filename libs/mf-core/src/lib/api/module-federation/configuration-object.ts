import { ConfigurationObject, RemoteContainerConfigurationModule } from './interface';
import { ConfigurationObjectPriorities } from '.';
import { createRemoteModuleAsync } from './remote-module';
import { findIndexFromEnd, uuidv4 } from './util';
import { isUrlFile } from '../urls';

/**
 * Returns a specific Configuration Object from COs list by name
 * Is used when we should get a last added CO by a specific name
 */
export function getConfigurationObjectIndexByName(name: string): number {
  const trimmedName = name.trim();

  return findIndexFromEnd(window.mfCOs, ((co) => {
    return co.name.trim() === trimmedName;
  }));
}

/**
 * Returns an active Configuration Object from the COs list by a specific name
 */
export function getActiveConfigurationObjectIndexByName(name: string): number {
  const trimmedName = name.trim();

  return findIndexFromEnd(window.mfCOs, ((co) => {
    return co.name.trim() === trimmedName && co.priority === ConfigurationObjectPriorities.Active;
  }));
};

/**
 * Returns a specific Configuration Object from COs list by uuid
 * Is used when a Configuration Objec has an identifier, so it means that the one probably is assigned to RCC
 */
export function getConfigurationObjectIndexByUuid(uuid: string): number {
  return findIndexFromEnd(window.mfCOs, ((co) => {
    return co.uuid === uuid;
  }));
}

/**
 * Marks a Configuration Object with a priority
 */
 export function markConfigurationObjectPriority(uuid: string, priority: ConfigurationObjectPriorities) {
  const index = getConfigurationObjectIndexByUuid(uuid);

  if (index > -1) {
    window.mfCOs[index].priority = priority;
  }
}

/**
 * Marks a last active (from a top of the list) Configuration Object as inactive,
 * this action can be excluded for a provided uuid
 */
export function deactivateLastActiveConfigurationObjectByName(name: string, uuid?: string) {
  const trimmedName = name.trim();

  const index = window.mfCOs.findIndex(((co) => {
    const shouldExcludeUuid = uuid
      ? co.uuid !== uuid
      : true;

    return co.name === trimmedName
      && co.priority === ConfigurationObjectPriorities.Active
      && shouldExcludeUuid;
  }));

  if (index < 0) {
    return;
  }

  window.mfCOs[index].priority = ConfigurationObjectPriorities.Inactive;
}

/**
 * Updates a Configuration Object and returns `uuid` if it's identified
 * In some cases when a CO is added but never be resolved (has no Uuid and RCC) we should update it by a provided uri
 * and add some props such as uuid, name and etc
 */
export function updateConfigurationObjectByUri(configurationObject: ConfigurationObject): string {
  const trimmedUri = configurationObject.uri.trim();

  const index = findIndexFromEnd(window.mfCOs, ((co) => {
    return co.uri.trim() === trimmedUri;
  }));

  if (index < 0) {
    return null;
  }

  const oldConfigurationObject = window.mfCOs[index];
  const uuid = oldConfigurationObject.uuid || configurationObject.uuid;

  window.mfCOs[index] = {
    ...oldConfigurationObject,
    uuid,
    version: configurationObject.version
  };

  return uuid;
}

/**
 * Strips Functions, other unclonable objects and etc from an array of Configuration Objects
 * Is used for the Local Storage, Cross-Domain messaging and etc.
 */
 export function transfromSafeConfigurationObjects(configurationObjects: ConfigurationObject[]): ConfigurationObject[] {
  return configurationObjects.map((co) => {
    return {
      uuid: co.uuid,
      uri: co.uri,
      name: co.name,
      priority: co.priority,
      definitionUri: co.definitionUri,
      version: co.version
    };
  });
}

/**
 * Adds a Configuration Object to the list
 */
 export function addConfigurationObject(configurationObject: ConfigurationObject) {
  const { name, priority } = configurationObject;

  if (priority === ConfigurationObjectPriorities.Active) {
    deactivateLastActiveConfigurationObjectByName(name);
  }

  configurationObject.uuid = uuidv4();
  window.mfCOs = window.mfCOs || [];
  window.mfCOs.push(configurationObject);
}

/**
 * Updates a Configuration Object in the list
 */
export function updateConfigurationObject(configurationObject: ConfigurationObject) {
  const { uri, name, uuid, definitionUri, priority } = configurationObject;
  const index = getConfigurationObjectIndexByUuid(uuid);

  if (index < 0) {
    return;
  }

  const { name: oldName, uri: oldUri, definitionUri: oldDefinitionUri } = window.mfCOs[index];

  // cases of a critical updating, we should unset the resolving status
  if (name !== oldName || uri !== oldUri || definitionUri !== oldDefinitionUri) {
    configurationObject.status = null;
  }

  if (priority === ConfigurationObjectPriorities.Active) {
    deactivateLastActiveConfigurationObjectByName(name);
  }

  window.mfCOs[index] = configurationObject;
}

/**
 * Updaes a Configuration Object with the status that resolves a remote container
 * or returns a Configuration Object status if the one was resolved before
 */
export function resolveConfigurationObject(configurationObject: ConfigurationObject, module: RemoteContainerConfigurationModule): Promise<any> {
  const {uuid, uri} = configurationObject;

  let index = getConfigurationObjectIndexByUuid(uuid);

  const foundConfigurationObject = window.mfCOs[index];

  if (!(foundConfigurationObject.status instanceof Promise)) {
    const configurationObjectWithStatus = {
      ...configurationObject,
      // if is remoteEntry.js => resolve
      // if is not => don't resolve, it suppose to be an Iframe URI
      status: isUrlFile(uri)
        ? createRemoteModuleAsync(configurationObject, module)
        : Promise.resolve(module)
    };

    window.mfCOs[index] = configurationObjectWithStatus;
    return configurationObjectWithStatus.status;
  }

  return foundConfigurationObject.status;
}
