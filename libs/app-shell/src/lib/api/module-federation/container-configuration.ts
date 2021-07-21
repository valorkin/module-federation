import { RemoteContainerConfiguration, RemoteContainerConfigurationModule } from "./interface"

/**
 * Adds a specific RemoteContainerConfiguration to RCCs list
 */
export const addRemoteContainerConfiguration = (container: RemoteContainerConfiguration): void => {
  const found = getRemoteContainerConfigurationByName(container.name);

  if (!found) {
    window._mfRCCs.push(container);
  }
}

/**
 * Returns a specific RemoteContainerConfigurationModule from RCCs list by a container name
 */
export const getRemoteContainerConfigurationByName = (containerName: string): RemoteContainerConfiguration => {
  return window._mfRCCs.find((container) => {
    return container.name.trim() === containerName.trim();
  });
}

/**
 * Returns a specific RemoteContainerConfigurationModule from RCCs list by a container name and module name
 */
export const getRemoteContainerConfigurationModuleByName = (containerName: string, moduleName: string): RemoteContainerConfigurationModule => {
  const container = getRemoteContainerConfigurationByName(containerName);

  if (!container || !Array.isArray(container.modules)) {
    return null;
  }

  return container.modules.find((containerModule) => {
    return containerModule.name.trim() === moduleName.trim();
  });
}
