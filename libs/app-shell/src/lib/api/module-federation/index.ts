import { ConfigurationObject, RemoteContainerConfiguration } from "./configuration.interface";

declare global {
  interface Window {
    mfCOs: ConfigurationObject[];
    _mfRCCs: RemoteContainerConfiguration[];
  }
}

window.mfCOs = window.mfCOs || [];
window._mfRCCs = window._mfRCCs || [];

export * from './module-federation';