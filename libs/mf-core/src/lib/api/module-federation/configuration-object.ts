import { ConfigurationObject, RemoteContainerConfigurationModule } from './interface';
import { createRemoteModuleAsync } from './remote-module';
import { findIndexFromEnd } from './util';

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
    return co.name.trim() === trimmedName && co.active;
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
 * Marks a Configuration Object as has/n't an error by uuid
 */
export function toggleFailedConfigurationObject(uuid: string, hasError: boolean) {
  const index = getConfigurationObjectIndexByUuid(uuid);

  if (index > -1) {
    // force value to be a boolean
    window.mfCOs[index].hasError = !!hasError;
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

    return co.name === trimmedName && co.active && shouldExcludeUuid;
  }));

  if (index < 0) {
    return;
  }

  window.mfCOs[index].active = false;
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
 * Updaes a Configuration Object with the status that resolves a remote container
 * or returns a Configuration Object status if the one was resolved before
 */
export function resolveConfigurationObject(configurationObject: ConfigurationObject, module: RemoteContainerConfigurationModule): Promise<any> {
  let index = getConfigurationObjectIndexByUuid(configurationObject.uuid);

  const foundConfigurationObject = window.mfCOs[index];

  if (!(foundConfigurationObject.status instanceof Promise)) {
    const configurationObjectWithStatus = {
      ...configurationObject,
      status: createRemoteModuleAsync(configurationObject, module)
    };

    window.mfCOs[index] = configurationObjectWithStatus;
    return configurationObjectWithStatus.status;
  }

  return foundConfigurationObject.status;
}
