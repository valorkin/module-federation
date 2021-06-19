import { RemoteContainerConfiguration, RemoteContainerConfigurationModule } from "./interface"

/**
 * Adds a specific RemoteContainerConfiguration to RCCs list
 */
export const addRemoteContainerConfiguration = (containerConfiguration: RemoteContainerConfiguration): void => {
  const found = getRemoteContainerConfigurationByName(containerConfiguration.name);

  if (!found) {
    window._mfRCCs.push(containerConfiguration);
  }
}

/**
 * Returns a specific RemoteContainerConfigurationModule from RCCs list by a configuration name
 */
export const getRemoteContainerConfigurationByName = (configurationName: string): RemoteContainerConfiguration => {
  return window._mfRCCs.find((containerConfiguration) => {
    return containerConfiguration.name.trim() === configurationName.trim();
  });
}

/**
 * Returns a specific RemoteContainerConfigurationModule from RCCs list by a configuration name and module name
 */
export const getRemoteContainerConfigurationModuleByName = (configurationName: string, moduleName: string): RemoteContainerConfigurationModule => {
  const remoteContainerConfiguration = getRemoteContainerConfigurationByName(configurationName);

  if (!remoteContainerConfiguration || !Array.isArray(remoteContainerConfiguration.modules)) {
    return null;
  }

  return remoteContainerConfiguration.modules.find((remoteContainerConfigurationModule) => {
    return remoteContainerConfigurationModule.name.trim() === moduleName.trim();
  });
}
