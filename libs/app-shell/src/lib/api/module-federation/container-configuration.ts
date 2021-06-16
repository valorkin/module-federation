import { RemoteContainerConfiguration } from "./configuration.interface"

export const addRemoteContainerConfiguration = (containerConfiguration: RemoteContainerConfiguration) => {
  const found = getRemoteContainerConfigurationByName(containerConfiguration.name);

  if (!found) {
    window._mfRCCs.push(containerConfiguration);
  }
}

export const getRemoteContainerConfigurationByName = (configurationName: string) => {
  return window._mfRCCs.find((containerConfiguration) => {
    return containerConfiguration.name.trim() === configurationName.trim();
  });
}

export const getRemoteContainerConfigurationModuleByName = (configurationName: string, module: string) => {
  const remoteContainerConfiguration = getRemoteContainerConfigurationByName(configurationName);

  if (!remoteContainerConfiguration || !Array.isArray(remoteContainerConfiguration.modules)) {
    return null;
  }

  return remoteContainerConfiguration.modules.find((remoteContainerConfigurationModule) => {
    return remoteContainerConfigurationModule.name.trim() === module;
  });
}
