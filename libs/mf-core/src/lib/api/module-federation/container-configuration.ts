import { RemoteContainerConfiguration, RemoteContainerConfigurationModule } from './interface';
import { findIndexFromEnd, fetchByUri } from './util';

/**
 * Adds a specific Remote Container Configuration to RCCs list
 */
export function addRemoteContainerConfiguration(container: RemoteContainerConfiguration): void {
  const index = getRemoteContainerConfigurationIndexByUri(container.uri);

  // if RCC not found then it should be added
  if (index < 0) {
    window._mfRCCs.push(container);
    return;
  }

  // if a new RCC differs from an old one then it should be added
  if (detectRemoteContainerConfigurationsDiff(container, window._mfRCCs[index])) {
    window._mfRCCs.push(container);
    return;
  }

  // if no difference we reassign an old RCC to a new CO
  window._mfRCCs[index].uuid = container.uuid;
}

/**
 * Returns a specific Remote Container Configuration Module from RCCs list by uuid
 */
export function getRemoteContainerConfigurationIndexByUuid(uuid: string): number {
  return findIndexFromEnd(window._mfRCCs, (container) => {
    return container.uuid === uuid;
  });
}

/**
 * Returns a specific Remote Container Configuration Module from RCCs list by uuid
 */
export function getRemoteContainerConfigurationByUuid(uuid: string): RemoteContainerConfiguration {
  const index = getRemoteContainerConfigurationIndexByUuid(uuid);
  return window._mfRCCs[index];
}

/**
 * Returns a specific Remote Container Configuration Module from RCCs list by uri
 */
export function getRemoteContainerConfigurationIndexByUri(uri: string): number {
  return findIndexFromEnd(window._mfRCCs, (container) => {
    return container.uri === uri;
  });
}

/**
 * Returns a specific Remote Container Configuration Module from RCCs list by a container uuid and module name
 */
export function getRemoteContainerConfigurationModuleByUuid(uuid: string, moduleName: string): RemoteContainerConfigurationModule {
  const container = getRemoteContainerConfigurationByUuid(uuid);

  if (!container || !Array.isArray(container.modules)) {
    return null;
  }

  const trimmedModuleName = moduleName.trim();

  return container.modules.find((containerModule) => {
    return containerModule.name.trim() === trimmedModuleName;
  });
}

/**
 * Loads remote RCCs list from uri
 */
export function loadRemoteContainerConfigurationsFile(uri: string): Promise<RemoteContainerConfiguration[]> {
  return fetchByUri(uri)
    .then((response) => response.json());
}

/**
 * Checks any difference between two RCCs
 */
export function detectRemoteContainerConfigurationsDiff(rcc1: RemoteContainerConfiguration, rcc2: RemoteContainerConfiguration): boolean {
  if (rcc1.version !== rcc2.version || rcc1.name !== rcc2.name || rcc1.provider !== rcc2.provider) {
    return true;
  }

  if (rcc1.modules.length !== rcc2.modules.length) {
    return true;
  }

  return rcc1.modules.some((rcc1Module, moduleIndex) => {
    for (let [rcc1Key] of Object.entries(rcc1Module)) {
      if (rcc1.modules[moduleIndex][rcc1Key] !== rcc2.modules[moduleIndex][rcc1Key]) {
        return true;
      };
    }
  });
}
