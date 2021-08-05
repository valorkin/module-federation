import { RemoteContainerConfiguration, RemoteContainerConfigurationModule } from './interface';

/**
 * Adds a specific RemoteContainerConfiguration to RCCs list
 */
export function addRemoteContainerConfiguration(container: RemoteContainerConfiguration): void {
  // TODO: Should look up for a container by its name and version
  const found = getRemoteContainerConfigurationByName(container.name);

  if (!found) {
    window._mfRCCs.push(container);
  }
}

/**
 * Returns a specific RemoteContainerConfigurationModule from RCCs list by a container name
 */
export function getRemoteContainerConfigurationByName(name: string): RemoteContainerConfiguration {
  const trimmedName = name.trim();

  return window._mfRCCs.find((container) => {
    return container.name === trimmedName;
  });
}

/**
 * Returns a specific RemoteContainerConfigurationModule from RCCs list by a container name and module name
 */
export function getRemoteContainerConfigurationModuleByName(containerName: string, moduleName: string): RemoteContainerConfigurationModule {
  const container = getRemoteContainerConfigurationByName(containerName);

  if (!container || !Array.isArray(container.modules)) {
    return null;
  }

  const trimmedModuleName = moduleName.trim();

  return container.modules.find((containerModule) => {
    return containerModule.name.trim() === trimmedModuleName;
  });
}
